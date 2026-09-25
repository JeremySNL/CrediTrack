import "dotenv/config.js";
import request from "supertest";
import app from "../../src/app.js";
import jwt from "jsonwebtoken";

const token = jwt.sign(
  {
    id: 1,
    email: "test@test.com",
    rol: "USUARIO",
  },
  process.env.JWT_SECRET,
  { expiresIn: "24h" },
);

describe("GET /prestamos", () => {
  it("deberia devolver todos los prestamos", async () => {
    const res = await request(app)
      .get("/prestamos")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("deberia rechazar peticion sin token", async () => {
    const res = await request(app).get("/prestamos");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("deberia rechazar peticion con token invalido", async () => {
    const res = await request(app)
      .get("/prestamos")
      .set("Authorization", `Bearer token-falsisimo`);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
});