import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import healthCheck from './routes/healthCheck.routes.js';

dotenv.config();
const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// cors confifrations
app.use(cors({ 
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}))


app.use("/api/v1/healthcheck", healthCheck);

app.get('/', (req, res) => {
    res.json({
        msg: "testing"
    })
})

export default app;