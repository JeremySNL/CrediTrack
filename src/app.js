import express from "express";

const app = express();

app.use(express.json());
//app.use(loggerMiddleware);

// Rutas modulares
//app.use("/auth", authRoutes);

export default app;