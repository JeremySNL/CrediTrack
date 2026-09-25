import prisma from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Rol } from "@prisma/client";

export const registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre) {
      return res.status(400).json({
        error: "Nombre requerido",
      });
    }
    if (!email) {
      return res.status(400).json({
        error: "Email requerido",
      });
    }
    if (!password) {
      return res.status(400).json({
        error: "Password requerido",
      });
    }
    if (rol && !Object.values(Rol).includes(rol)) {
      return res.status(400).json({
        error: "Rol invalido",
      });
    }

    const existe = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existe) {
      return res.status(400).json({
        error: "El usuario ya existe",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hash,
        rol,
      },
    });

    res.status(201).json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar un usuario" });
    console.log("Error al registrar un usuario:\n", error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email requerido",
      });
    }
    if (!password) {
      return res.status(400).json({
        error: "Password requerido",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    const valido = await bcrypt.compare(password, usuario.password);

    if (!valido) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error al logear un usuario" });
    console.log("Error al logear un usuario:\n", error);
  }
};

export const getMe = async (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      error: "Token requerido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    res.json(jwt.verify(token, process.env.JWT_SECRET));

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado",
    });
  }
};
