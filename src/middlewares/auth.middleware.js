import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      error: "Token requerido"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.usuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    next();

  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado"
    });
  }
};