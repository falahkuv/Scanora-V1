const request = require("supertest");
const app = require("../src/app");
const { prisma } = require("../src/config/prisma");
const axios = require("axios");

jest.mock("axios");

const clearDatabase = async () => {
  await prisma.inventory.deleteMany();
  await prisma.scanHistory.deleteMany();
  await prisma.user.deleteMany();
};

describe("Scan API", () => {
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

  it("creates a scan from FastAPI prediction", async () => {
    axios.post.mockResolvedValue({
      data: {
        prediction: { product: "Banana", condition: "rotten" },
        confidence: { product_confidence: 0.9, condition_confidence: 0.85 },
        freshness_index: 0.0
      }
    });

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
    const buffer = Buffer.from("fake-image", "utf-8");

    const response = await request(app)
      .post("/api/scan")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", buffer, {
        filename: "banana.jpg",
        contentType: "image/jpeg"
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.fruit_type).toBe("banana");
    expect(response.body.data.condition).toBe("rotten");
    expect(response.body.data.confidence.product_confidence).toBe(0.9);
    expect(axios.post).toHaveBeenCalled();
  });
});
