jest.mock("../src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

const request = require("supertest");
const app = require("../src/app");
const { prisma } = require("../src/config/prisma");
const { supabase } = require("../src/config/supabase");

const clearDatabase = async () => {
  await prisma.inventory.deleteMany();
  await prisma.scanHistory.deleteMany();
  await prisma.user.deleteMany();
};

const registerUser = (email, password) =>
  request(app).post("/api/auth/register").send({ name: "Jane Doe", email, password });

const login = (email, password) =>
  request(app).post("/api/auth/login").send({ email, password });

describe("Reset Password API", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it("syncs new password to app DB so login with new password works", async () => {
    const email = "reset@example.com";
    await registerUser(email, "oldpassword123");

    supabase.auth.getUser.mockResolvedValue({
      data: { user: { email, user_metadata: {} } },
      error: null
    });

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ accessToken: "valid-token", password: "newpassword123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(supabase.auth.getUser).toHaveBeenCalledWith("valid-token");

    const newLogin = await login(email, "newpassword123");
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.data.token).toBeTruthy();

    const oldLogin = await login(email, "oldpassword123");
    expect(oldLogin.status).toBe(401);
  });

  it("creates the user (upsert) when not present in app DB", async () => {
    const email = "newuser@example.com";

    supabase.auth.getUser.mockResolvedValue({
      data: { user: { email, user_metadata: { full_name: "New User" } } },
      error: null
    });

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ accessToken: "valid-token", password: "newpassword123" });

    expect(res.status).toBe(200);

    const newLogin = await login(email, "newpassword123");
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.data.user.name).toBe("New User");
  });

  it("returns 401 for an invalid/expired reset session", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: null,
      error: { message: "invalid token" }
    });

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ accessToken: "bad-token", password: "newpassword123" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when password is too short", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ accessToken: "valid-token", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
