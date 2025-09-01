import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import { securityHeaders } from "./middleware/securityMiddleware.js";

dotenv.config();

const app: Application = express();

// Security headers middleware
app.use(securityHeaders);

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL as string], // frontend URL
    credentials: true, // allow cookies
  })
);
app.use(express.json({ limit: "10mb" })); // Limit request body size
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

export default app;
