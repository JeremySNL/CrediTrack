import "dotenv/config.js";
import request from "supertest";
import app from "../../src/app.js";
import jwt from "jsonwebtoken";
import prisma from "../../src/db.js";

let usuario;
let cliente;
let prestamo;
let cuota;
let pago;

const token = jwt.sign(
  {
    id: 1,
    email: "test@test.com",
    rol: "USUARIO",
  },
  process.env.JWT_SECRET,
  { expiresIn: "24h" },
);

describe("POST /cuotas/:id/pagos", () => {
  beforeAll(async () => {
    usuario = await prisma.usuario.create({
      data: {
        nombre: "Usuario Test",
        email: "test-pagos@test.com",
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

    prestamo = await prisma.prestamo.create({
      data: {
        monto: 10000,
        interes: 5,
        cantidadCuotas: 12,
        frecuenciaPago: "MENSUAL",
        fechaInicio: new Date("2026-09-01"),
        fechaFin: new Date("2027-09-01"),
        usuarioId: usuario.id,
        clienteId: cliente.id,
      },
    });

    cuota = await prisma.cuota.create({
      data: {
        monto: 1000,
        montoPagado: 0,
        montoPendiente: 1000,
        prestamoId: prestamo.id,
      },
    });
  });

  it("deberia registrar el pago correctamente", async () => {
    const res = await request(app)
      .post(`/cuotas/${cuota.id}/pagos`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 500,
        fecha: "2026-09-15",
      });

    pago = res.body;

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      cuotaId: cuota.id,
    });
  });

  it("deberia rechazar un pago sin monto", async () => {
    const res = await request(app)
      .post(`/cuotas/${cuota.id}/pagos`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        fecha: "2026-09-15",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un pago con monto invalido", async () => {
    const res = await request(app)
      .post(`/cuotas/${cuota.id}/pagos`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: "monto-invalido",
        fecha: "2026-09-15",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un pago sin fecha", async () => {
    const res = await request(app)
      .post(`/cuotas/${cuota.id}/pagos`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 500,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un pago mayor al monto pendiente", async () => {
    const res = await request(app)
      .post(`/cuotas/${cuota.id}/pagos`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 1500,
        fecha: "2026-09-15",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar una cuota inexistente", async () => {
    const res = await request(app)
      .post("/cuotas/999999/pagos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 500,
        fecha: "2026-09-15",
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con id negativo o cero", async () => {
    const res = await request(app)
      .post("/cuotas/-1/pagos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 500,
        fecha: "2026-09-15",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con id no numerico", async () => {
    const res = await request(app)
      .post("/cuotas/asdasdad/pagos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 500,
        fecha: "2026-09-15",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion sin token", async () => {
    const res = await request(app).post(`/cuotas/${cuota.id}/pagos`).send({
      monto: 500,
      fecha: "2026-09-15",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con token invalido", async () => {
    const res = await request(app)
      .post(`/cuotas/${cuota.id}/pagos`)
      .set("Authorization", `Bearer token`)
      .send({
        monto: 500,
        fecha: "2026-09-15",
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  afterAll(async () => {
    if (pago && pago.id) {
      await prisma.pago.delete({
        where: {
          id: pago.id,
        },
      });
    }
    if (cuota) {
      await prisma.cuota.delete({
        where: {
          id: cuota.id,
        },
      });
    }
    if (prestamo) {
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