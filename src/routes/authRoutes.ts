import { Router } from "express";

const router = Router();

// test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth route working ✅" });
});

export default router;
