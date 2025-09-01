import { Router } from "express";
import {
  signup,
  signin,
  verifyOtp,
  refreshAccessToken,
  getMe,
  logout,
} from "../controllers/authController.js";
import {
  getGoogleAuthUrl,
  googleCallback,
} from "../controllers/googleAuthController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
import {
  authRateLimit,
  sanitizeInput,
} from "../middleware/securityMiddleware.js";

const router: Router = Router();

// Regular email authentication routes
router.post("/signup", authRateLimit, sanitizeInput, signup);
router.post("/signin", authRateLimit, sanitizeInput, signin);
router.post("/verify-otp", authRateLimit, verifyOtp);
router.post("/refresh", refreshAccessToken);
router.get("/me", verifyJWT, getMe);
router.post("/logout", verifyJWT, logout);

// Google OAuth routes
router.get("/google/auth-url", getGoogleAuthUrl);
router.get("/google/callback", googleCallback);

export default router;
