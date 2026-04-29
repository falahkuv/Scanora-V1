const request = require("supertest");
const app = require("../src/app");
const { prisma } = require("../src/config/prisma");

const clearDatabase = async () => {
  await prisma.inventory.deleteMany();
  await prisma.scanHistory.deleteMany();
  await prisma.user.deleteMany();
};

describe("Auth API", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it("registers a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123"
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe("jane@example.com");
    expect(response.body.data.token).toBeTruthy();
  });

  it("logs in and returns a token", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "password123"
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeTruthy();
  });

  it("returns the current user profile", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123"
    });

    const login = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "password123"
    });

    const token = login.body.data.token;

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe("jane@example.com");
  });
});
