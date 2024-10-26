import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../src/index";
import User from "../../src/modules/user/user.model";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  app.close();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("create user ", () => {
  it("should create a user", async () => {
    const response = await request(app).post("/user").send({
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
      firstname: "John",
      lastname: "Doe",
    });
    console.log(response.body);

    expect(response.status).toBe(201);
    const user = await User.findOne({ email: "john@example.com" });
    console.log(user);
  });

  it(" email not valid ", async () => {
    const response = await request(app).post("/user").send({
      email: "john",
      password: "password123",
      confirmPassword: "password123",
      firstname: "John",
      lastname: "Doe",
    });

    expect(response.status).toBe(400);
  });

  it("firstname is required", async () => {
    const response = await request(app).post("/user").send({
      email: "john",
      password: "password123",
      confirmPassword: "password123",
      lastname: "Doe",
    });

    expect(response.status).toBe(400);
    expect(response.body.errors.firstname[0]).toBe(
      "firstname is a required field",
    );
  });
});
