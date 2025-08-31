import { Request, Response } from "express";
import User from "../models/User";
import { sendOtp } from "../utils/sendOtp";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";

// ------------------- TOKEN HELPERS -------------------
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
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ------------------- CONTROLLERS -------------------

// SIGNUP
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, dob, email } = req.body;

    if (!name || !dob || !email) {
      res.status(400).json({ message: "Name, DOB and Email are required" });
      return;
    }

    // Email regex check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.json({
        success: false,
        message: "User already exists. Please login instead.",
      });
      return;
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const newUser = new User({ name, dob, email, otp, otpExpiry });
    await newUser.save();

    await sendOtp(email, otp);

    res.json({ message: "OTP sent successfully for signup" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// SIGNIN
export const signin = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.json({
        success: false,
        message: "User not found. Please signup first.",
      });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOtp(email, otp);

    res.json({ success: true, message: "OTP sent successfully for signin" });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// VERIFY OTP
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
      return;
    }

    user.otp = undefined;
    user.otpExpiry = undefined;

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);
    user.refreshToken = refreshToken;
    await user.save();

    setTokensAsCookies(res, accessToken, refreshToken);

    // Manually build safe user response (exclude otp & refreshToken)
    res.json({
      message: "OTP verified",
      user: {
        id: user.id,
        name: user.name,
        dob: user.dob,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// REFRESH TOKEN
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.["refreshToken"];
    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token is required" });
      return;
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "refreshsecret",
      (err, decoded: any) => {
        if (err) {
          res.status(403).json({ message: "Invalid or expired refresh token" });
          return;
        }

        const newAccessToken = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET || "defaultsecret",
          { expiresIn: "15m" }
        );

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

// LOGOUT
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Error logging out" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id).select("-otp -otpExpiry");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Error fetching user details" });
  }
};
