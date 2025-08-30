import { Router } from "express";
import {
  signup,
  signin,
  verifyOtp,
  refreshAccessToken,
} from "../controllers/authController.js";

const router: Router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/verify-otp", verifyOtp);
router.post("/refresh", refreshAccessToken);

export default router;
