import "dotenv/config.js";
import request from "supertest";
import app from "../../src/app.js";
import jwt from "jsonwebtoken";
import prisma from "../../src/db.js";

let usuario;
let cliente;
let prestamo;

const token = jwt.sign(
  {
    id: 1,
    email: "test@test.com",
    rol: "USUARIO",
  },
  process.env.JWT_SECRET,
  { expiresIn: "24h" },
);

const data = {
  monto: 10000,
  interes: 5,
  cantidadCuotas: 12,
  frecuenciaPago: "MENSUAL",
  fechaInicio: "2026-09-01",
  fechaFin: "2027-09-01",
};

describe("POST /prestamos", () => {
  beforeAll(async () => {
    usuario = await prisma.usuario.create({
      data: {
        nombre: "Usuario Test",
        email: "test-prestamos@test.com",
        password: "123456",
        rol: "USUARIO",
      },
    });

    cliente = await prisma.cliente.create({
      data: {
        nombre: "Cliente Test",
        cedula: "40228583528",
        telefono: "8093930000",
        direccion: "Direccion Test",
      },
    });
  });

  it("deberia crear el prestamo correctamente", async () => {
    const res = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...data,
        usuarioId: usuario.id,
        clienteId: cliente.id,
      });

    prestamo = res.body;

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      usuarioId: usuario.id,
      clienteId: cliente.id,
    });
  });

  it("deberia rechazar un prestamo sin monto", async () => {
    const res = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        interes: 5,
        cantidadCuotas: 12,
        frecuenciaPago: "MENSUAL",
        fechaInicio: "2026-09-01",
        fechaFin: "2027-09-01",
        usuarioId: usuario.id,
        clienteId: cliente.id,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un prestamo sin interes", async () => {
    const res = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 10000,
        cantidadCuotas: 12,
        frecuenciaPago: "MENSUAL",
        fechaInicio: "2026-09-01",
        fechaFin: "2027-09-01",
        usuarioId: usuario.id,
        clienteId: cliente.id,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un prestamo sin cantidadCuotas", async () => {
    const res = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 10000,
        interes: 5,
        frecuenciaPago: "MENSUAL",
        fechaInicio: "2026-09-01",
        fechaFin: "2027-09-01",
        usuarioId: usuario.id,
        clienteId: cliente.id,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un prestamo sin frecuenciaPago", async () => {
    const res = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 10000,
        interes: 5,
        cantidadCuotas: 12,
        fechaInicio: "2026-09-01",
        fechaFin: "2027-09-01",
        usuarioId: usuario.id,
        clienteId: cliente.id,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un prestamo sin fechaInicio", async () => {
    const res = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 10000,
        interes: 5,
        cantidadCuotas: 12,
        frecuenciaPago: "MENSUAL",
        fechaFin: "2027-09-01",
        usuarioId: usuario.id,
        clienteId: cliente.id,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un prestamo sin fechaFin", async () => {
    const res = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 10000,
        interes: 5,
        cantidadCuotas: 12,
        frecuenciaPago: "MENSUAL",
        fechaInicio: "2026-09-01",
        usuarioId: usuario.id,
        clienteId: cliente.id,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un prestamo sin clienteId", async () => {
    const res = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 10000,
        interes: 5,
        cantidadCuotas: 12,
        frecuenciaPago: "MENSUAL",
        fechaInicio: "2026-09-01",
        fechaFin: "2027-09-01",
        usuarioId: usuario.id,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un prestamo con datos invalidos", async () => {
    const res = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: "monto-invalido",
        interes: 5,
        cantidadCuotas: 12,
        frecuenciaPago: "MENSUAL",
        fechaInicio: "2026-09-01",
        fechaFin: "2027-09-01",
        usuarioId: usuario.id,
        clienteId: cliente.id,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un cliente inexistente", async () => {
    const res = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 10000,
        interes: 5,
        cantidadCuotas: 12,
        frecuenciaPago: "MENSUAL",
        fechaInicio: "2026-09-01",
        fechaFin: "2027-09-01",
        usuarioId: usuario.id,
        clienteId: 999999,
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion sin token", async () => {
    const res = await request(app).post("/prestamos").send({
      ...data,
      usuarioId: usuario.id,
      clienteId: cliente.id,
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con token invalido", async () => {
    const res = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer token`)
      .send({
        ...data,
        usuarioId: usuario.id,
        clienteId: cliente.id,
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  afterAll(async () => {
    if (prestamo && prestamo.id) {
      await prisma.prestamo.delete({
        where: {
          id: prestamo.id,
        },
      });
    }
    if (cliente) {
      await prisma.cliente.delete({
        where: {
          id: cliente.id,
        },
      });
    }
    if (usuario) {
      await prisma.usuario.delete({
        where: {
          id: usuario.id,
        },
      });
    }
  });
});