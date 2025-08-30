import { Router, Request, Response } from "express";

const router: Router = Router();

router.get("/test", (req: Request, res: Response) => {
  res.json({ message: "Notes route working ✅" });
});

export default router;
