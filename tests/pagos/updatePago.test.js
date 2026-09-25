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

describe("PUT /pagos/:id", () => {
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

    pago = await prisma.pago.create({
      data: {
        monto: 500,
        fecha: new Date("2026-09-15"),
        cuotaId: cuota.id,
      },
    });
  });

  it("deberia actualizar el pago correctamente", async () => {
    const res = await request(app)
      .put(`/pagos/${pago.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 800,
        fecha: "2026-09-20",
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: pago.id,
    });
  });

  it("deberia rechazar un pago inexistente", async () => {
    const res = await request(app)
      .put("/pagos/999999")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 800,
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con id negativo o cero", async () => {
    const res = await request(app)
      .put("/pagos/-1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 800,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con id no numerico", async () => {
    const res = await request(app)
      .put("/pagos/asdasdad")
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: 800,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar un pago con monto invalido", async () => {
    const res = await request(app)
      .put(`/pagos/${pago.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        monto: "monto-invalido",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion sin token", async () => {
    const res = await request(app)
      .put(`/pagos/${pago.id}`)
      .send({
        monto: 800,
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con token invalido", async () => {
    const res = await request(app)
      .put(`/pagos/${pago.id}`)
      .set("Authorization", `Bearer token`)
      .send({
        monto: 800,
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  afterAll(async () => {
    if (pago) {
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