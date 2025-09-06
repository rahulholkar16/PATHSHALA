import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import cookiesParse from "cookie-parser";
import healthCheck from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";

dotenv.config();
const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookiesParse());

// cors confifrations
app.use(cors({ 
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}))


app.use("/api/v1/healthcheck", healthCheck);
app.use("/api/v1/auth", authRouter);

export default app;