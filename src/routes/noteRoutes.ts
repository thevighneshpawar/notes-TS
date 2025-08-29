import { Router } from "express";

const router = Router();

// test route
router.get("/test", (req, res) => {
  res.json({ message: "Notes route working ✅" });
});

export default router;
