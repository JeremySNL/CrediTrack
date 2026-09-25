import { Router } from "express";
import { registrar, login, getMe } from "../controllers/auth.controller.js";

const router = Router();

router.post("/registro", registrar);
router.post("/login", login);
router.get("/me", getMe);

export default router;
