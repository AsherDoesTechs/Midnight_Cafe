// server.ts (Supabase backend version)

import express from "express";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";

// --- Import Routers ---
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import menuRouter from "./routes/menu.js";
import contactRouter from "./routes/contact.js";
import analyticsRouter from "./routes/analytics.js";
import userLogsRouter from "./routes/UserLogs.js";
import customRouter from "./routes/custom.js";
import historyOrdersRouter from "./routes/history_order.js";

dotenv.config();

// -----------------------------
// Supabase Setup
// -----------------------------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key on backend
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase URL or Service Role Key missing!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }, // We manage auth via cookies
});

// -----------------------------
// Nodemailer Setup
// -----------------------------
const createTransporter = () => {
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    console.warn("⚠️ Nodemailer credentials not set. Email disabled.");
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

// -----------------------------
// Start Server
// -----------------------------
const startServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 5000;
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  // --- Uploads Directory ---
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = path.join(__dirname, "..");
  const uploadsDir = path.join(projectRoot, "public/uploads");

  await fs.mkdir(uploadsDir, { recursive: true });

  // --- Middleware ---
  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.static(path.join(projectRoot, "public")));

  // --- Routes (Supabase-aware) ---
  app.use("/api/auth", authRouter({ supabase, transporter }));
  app.use("/api", ordersRouter({ supabase }));
  app.use("/api", menuRouter({ supabase, uploadsDir }));
  app.use("/api", analyticsRouter({ supabase }));
  app.use("/api", userLogsRouter({ supabase }));
  app.use("/api/custom", customRouter({ supabase }));
  app.use("/api/history", historyOrdersRouter({ supabase }));
  app.use("/api", contactRouter({ transporter }));

  // --- Default Route ---
  app.get("/", (req, res) => {
    res.send("Supabase backend API running ✅");
  });

  // --- Start Server ---
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Supabase backend fully active.`);
  });
};

startServer();
