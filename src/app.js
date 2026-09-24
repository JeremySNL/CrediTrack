import express from "express";
import authRoutes from "./routes/auth.routes.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";

const app = express();

app.use(express.json());
app.use(loggerMiddleware);

// Rutas modulares
app.use("/auth", authRoutes);

export default app;