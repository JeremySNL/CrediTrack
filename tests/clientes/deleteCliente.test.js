import "dotenv/config.js";
import request from "supertest";
import app from "../../src/app.js";
import jwt from "jsonwebtoken";
import prisma from "../../src/db.js";

let cliente;

const token = jwt.sign(
  {
    id: 1,
    email: "test@test.com",
    rol: "USUARIO",
  },
  process.env.JWT_SECRET,
  { expiresIn: "24h" },
);

describe("DELETE /clientes/:id", () => {
  beforeAll(async () => {
    cliente = await prisma.cliente.create({
      data: {
        nombre: "Cliente Test",
        cedula: "40228583528",
        telefono: "8093930000",
        direccion: "Direccion Test",
      },
    });
  });

  it("deberia eliminar el cliente correctamente", async () => {
    const res = await request(app)
      .delete(`/clientes/${cliente.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("deberia rechazar un cliente inexistente", async () => {
    const res = await request(app)
      .delete("/clientes/999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con id negativo o cero", async () => {
    const res = await request(app)
      .delete("/clientes/-1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con id no numerico", async () => {
    const res = await request(app)
      .delete("/clientes/asdasdad")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion sin token", async () => {
    const res = await request(app).delete(`/clientes/${cliente.id}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con token invalido", async () => {
    const res = await request(app)
      .delete(`/clientes/${cliente.id}`)
      .set("Authorization", `Bearer token`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  afterAll(async () => {
    if (cliente) {
      await prisma.cliente.delete({
        where: {
          id: cliente.id,
        },
      });
    }
  });
});