import { Request, Response } from "express";
import axios from "axios";
import User from "../models/User.js";
import {
  generateGoogleTokens,
  setGoogleTokensAsCookies,
} from "../utils/googleAuth.js";

// Step 1: Send Google Auth URL to frontend
export const getGoogleAuthUrl = async (req: Request, res: Response) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:3000/api/auth/google/callback";

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `access_type=offline&` +
      `prompt=consent`;

    res.json({ success: true, authUrl });
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    res
      .status(500)
      .json({ success: false, message: "Error generating Google auth URL" });
  }
};

// Step 2: Callback to exchange code -> tokens -> user info
export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query["code"] as string;
  //console.log(code);

  if (!code) {
    return res
      .status(400)
      .json({ success: false, message: "Authorization code missing" });
  }

  try {
    // Exchange authorization code for tokens
    const { data } = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env["GOOGLE_CLIENT_SECRET"]!,
        redirect_uri:
          process.env.GOOGLE_REDIRECT_URI ||
          "http://localhost:5000/api/auth/google/callback",
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { id_token } = data;
    //console.log(data);

    // Decode ID token (basic user info)
    const decoded = JSON.parse(
      Buffer.from(id_token.split(".")[1], "base64").toString()
    );
    const { email, name, sub: googleId, email_verified } = decoded;

    if (!email_verified) {
      return res
        .status(400)
        .json({ success: false, message: "Email not verified with Google" });
    }

    // Check if user exists, otherwise create
    let user = await User.findOne({ email, authType: "google" });
    if (!user) {
      user = new User({ name, email, googleId, authType: "google" });
      await user.save();
    }

    // Generate your own JWTs
    const { accessToken, refreshToken } = generateGoogleTokens(
      user.id,
      user.email
    );
    user.refreshToken = refreshToken;
    await user.save();

    // Set secure cookies
    setGoogleTokensAsCookies(res, accessToken, refreshToken);

    // Redirect back to frontend app (with success)
    res.redirect("http://localhost:5173/notes");
  } catch (err) {
    console.error("Google callback error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};
