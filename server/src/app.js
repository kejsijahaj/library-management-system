import cors from "cors";
import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
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

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
