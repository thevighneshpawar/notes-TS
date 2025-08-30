import { Request, Response } from "express";
import User, { IUser } from "../models/User.js";
import { sendOtp } from "../utils/sendOtp.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET || "defaultsecret",
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: userId, email },
    process.env.JWT_REFRESH_SECRET || "refreshsecret",
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

const setTokensAsCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Signup (generate OTP)
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, dob, email } = req.body;

    if (!name || !dob || !email) {
      return res
        .status(400)
        .json({ message: "Name, DOB and Email are required" });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists. Please login instead.",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Create new user
    const newUser = new User({
      name,
      dob,
      email,
      otp,
      otpExpiry,
    });

    await newUser.save();

    // Send OTP
    await sendOtp(email, otp);

    res.json({ message: "OTP sent successfully for signup" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please sign up first." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOtp(email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      user.email
    );

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    setTokensAsCookies(res, accessToken, refreshToken);

    return res.json({
      message: "OTP verified",
      user: { name: user.name, dob: user.dob, email: user.email },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ message: "Error verifying OTP" });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Verify refresh token
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "refreshsecret",
      (err: jwt.VerifyErrors | null) => {
        if (err) {
          res.status(403).json({ message: "Invalid or expired refresh token" });
          return;
        }

        const newAccessToken = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET || "defaultsecret",
          { expiresIn: "15m" }
        );

        // replace cookie
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });

        res.json({ message: "Access token refreshed" });
      }
    );
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ message: "Error refreshing token" });
  }
};
