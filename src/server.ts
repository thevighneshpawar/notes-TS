import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env["PORT"] || 5000;
const MONGO_URI = process.env["MONGO_URI"] || "";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
