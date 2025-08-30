import { Response } from "express";
import Note from "../models/Note.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

// CREATE
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: "Title and content are required" });
      return;
    }

    const note = await Note.create({
      title,
      content,
      userId: req.user?.id,
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ message: "Error creating note" });
  }
};

// READ
export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.user?.id }).sort({
      createdAt: -1,
    });
    res.json(notes);
  } catch (err) {
    console.error("Get notes error:", err);
    res.status(500).json({ message: "Error fetching notes" });
  }
};

// DELETE
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Handle invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid note ID" });
      return;
    }

    const note = await Note.findOneAndDelete({ _id: id, userId: req.user?.id });
    if (!note) {
      res.status(404).json({ message: "Note not found or unauthorized" });
      return;
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ message: "Error deleting note" });
  }
};
