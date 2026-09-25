import "dotenv/config.js";
import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/db.js";

let usuario;

describe("POST /auth/registro", () => {
  it("deberia registrar el usuario correctamente", async () => {
    const res = await request(app).post("/auth/registro").send({
      nombre: "test",
      email: "test-me@test.com",
      password: "12345",
      rol: "USUARIO",
    });

    usuario = res.body;

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    });
  });

  it("deberia rechazar un email duplicado", async () => {
    await request(app).post("/auth/registro").send({
      nombre: "test",
      email: "test-me@test.com",
      password: "12345",
      rol: "USUARIO",
    });

    const res = await request(app).post("/auth/registro").send({
      nombre: "otro usuario",
      email: "test-me@test.com",
      password: "12345",
      rol: "USUARIO",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");

    await prisma.usuario.deleteMany({
      where: { email: "test-me@test.com" },
    });
  });

  it("deberia rechazar un usuario sin nombre", async () => {
    const res = await request(app).post("/auth/registro").send({
      email: "test-sin-nombre@test.com",
      password: "12345",
      rol: "USUARIO",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un usuario sin email", async () => {
    const res = await request(app).post("/auth/registro").send({
      nombre: "test",
      password: "12345",
      rol: "USUARIO",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un usuario sin password", async () => {
    const res = await request(app).post("/auth/registro").send({
      nombre: "test",
      email: "test-sin-password@test.com",
      rol: "USUARIO",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({
      where: {
        email: {
          in: [
            "test-me@test.com",
            "test-sin-password@test.com",
            "test-sin-nombre@test.com",
          ],
        },
      },
    });
  });
});
