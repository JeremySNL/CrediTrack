import express from "express";
import loggerMiddleware from "./middlewares/logger.middleware.js";

const app = express();

app.use(express.json());
app.use(loggerMiddleware);

// Rutas modulares
//app.use("/auth", authRoutes);

export default app;