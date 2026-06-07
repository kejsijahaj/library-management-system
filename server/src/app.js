import cors from "cors";
import express from "express";
import morgan from "morgan";
import healthRoutes from "./routes/healthRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/health", healthRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
