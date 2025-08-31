import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import noteRoutes from "./routes/noteRoutes";

dotenv.config();

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL as string], // frontend URL
    credentials: true, // allow cookies
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

export default app;
