import { Router } from "express";
import {
  signup,
  signin,
  verifyOtp,
  refreshAccessToken,
  getMe,
  logout,
} from "../controllers/authController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router: Router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/verify-otp", verifyOtp);
router.post("/refresh", refreshAccessToken);
router.get("/me", verifyJWT, getMe);
router.post("/logout", verifyJWT, logout);
export default router;
