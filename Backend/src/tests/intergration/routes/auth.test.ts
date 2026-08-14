import { MongoMemoryServer } from "mongodb-memory-server";
import {
  connectionTestDb,
  disconnectTestDb,
  clearTestDb,
} from "../../helpers/superTestDb";
import { User } from "../../../models/user-model";
import request from "supertest";
import app from "../../helpers/testServer";

beforeAll(async () => {
  await connectionTestDb();
});

afterEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

describe("Auth flow (Integration)",() => {
  test("should patch/api/auth/send-otp - send OTP and create user record in database ", async () => {
    const contactNumber = "9999999999";
    const res = await request(app)
      .patch("/api/user-validation/sendOtp")
      .send({ contactNumber });
    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();

    // Confirm a user was actually generate in database with an OTP set

    const userInDb = await User.findOne({ contactNumber });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.otp).toBeTruthy();
  });
});
