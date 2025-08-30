import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import {
  createNote,
  getNotes,
  deleteNote,
} from "../controllers/noteController.js";

const router: Router = Router();

// All routes protected
router.post("/", verifyJWT, createNote);
router.get("/", verifyJWT, getNotes);
router.delete("/:id", verifyJWT, deleteNote);

export default router;
