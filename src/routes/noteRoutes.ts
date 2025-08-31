import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware";
import {
  createNote,
  getNotes,
  deleteNote,
  updateNote,
} from "../controllers/noteController";

const router: Router = Router();

// All routes protected
router.post("/", verifyJWT, createNote);
router.get("/", verifyJWT, getNotes);
router.delete("/:id", verifyJWT, deleteNote);
router.put("/:id", verifyJWT, updateNote);

export default router;
