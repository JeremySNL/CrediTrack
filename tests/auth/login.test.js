import "dotenv/config.js";
import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

let usuario;
const password = "123456";

describe("POST /auth/login", () => {
  beforeAll(async () => {
    const hash = await bcrypt.hash(password, 10);

    usuario = await prisma.usuario.create({
      data: {
        nombre: "Usuario Test",
        email: "test-me@test.com",
        password: hash,
        rol: "USUARIO",
      },
    });
  });

  it("deberia logearse correctamente", async () => {
    const res = await request(app).post("/auth/login").send({
      email: usuario.email,
      password: password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);

    expect(decoded).toMatchObject({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });
  });

  it("deberia rechazar login sin email", async () => {
    const res = await request(app).post("/auth/login").send({
      password: password,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar login sin password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: usuario.email,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar una password incorrecta", async () => {
    const res = await request(app).post("/auth/login").send({
      email: usuario.email,
      password: "contraseña-incorrecta",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un email inexistente", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "no-existe@test.com",
      password: password,
    });

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
