import express from 'express';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookiesParse from "cookie-parser";
import healthCheck from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import courseRouter from "./routes/course.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookiesParse());
app.use("/offline-host", express.static(path.join(__dirname, "offlineP2P/host")));
app.use("/offline-student", express.static(path.join(__dirname, "offlineP2P/student")));

// cors confifrations
app.use(cors({ 
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}))


app.use("/api/v1/healthcheck", healthCheck);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/auth", courseRouter);

export default app;