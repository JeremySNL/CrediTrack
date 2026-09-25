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

describe("POST /clientes", () => {
  it("deberia crear el cliente correctamente", async () => {
    const data = {
      nombre: "Cliente Test",
      cedula: "40228583528",
      telefono: "8093930000",
      direccion: "Direccion Test",
    };

    const res = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send(data);

    cliente = res.body;

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(data);
  });

  it("deberia rechazar un cliente sin nombre", async () => {
    const res = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        cedula: "40228583528",
        telefono: "8093930000",
        direccion: "Direccion Test",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un cliente sin cedula", async () => {
    const res = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Cliente Test",
        telefono: "8093930000",
        direccion: "Direccion Test",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un cliente sin telefono", async () => {
    const res = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Cliente Test",
        cedula: "40228583528",
        direccion: "Direccion Test",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un cliente sin direccion", async () => {
    const res = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Cliente Test",
        cedula: "40228583528",
        telefono: "8093930000",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion sin token", async () => {
    const res = await request(app).post("/clientes").send({
      nombre: "Cliente Test",
      cedula: "40228583528",
      telefono: "8093930000",
      direccion: "Direccion Test",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con token invalido", async () => {
    const res = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer token`)
      .send({
        nombre: "Cliente Test",
        cedula: "40228583528",
        telefono: "8093930000",
        direccion: "Direccion Test",
      });

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