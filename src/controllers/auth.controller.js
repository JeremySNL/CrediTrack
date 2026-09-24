import prisma from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

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
        rol: rol || "usuario",
      },
    });

    res.status(201).json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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
    res.status(500).json({ error: "Error interno" });
  }
};
