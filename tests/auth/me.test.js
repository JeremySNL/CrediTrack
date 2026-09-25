import "dotenv/config.js";
import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

let usuario;
let token;

describe("GET /auth/me", () => {
  beforeAll(async () => {
    const hash = await bcrypt.hash("123456", 10);

    usuario = await prisma.usuario.create({
      data: {
        nombre: "Usuario Test",
        email: "test-me@test.com",
        password: hash,
        rol: "USUARIO",
      },
    });

    token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );
  });

  it("deberia devolver datos del usuario del JWT", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });
  });

  it("deberia rechazar peticion sin token", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un token invalido", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer token-falso");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  afterAll(async () => {
    if (usuario) {
      await prisma.usuario.delete({
        where: {
          id: usuario.id,
        },
      });
    }
  });
});
