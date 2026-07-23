import request from "supertest";
import { Express } from "express";
import createTestApp from "../../helpers/testServer";
import {
  connectionTestDb,
  clearTestDb,
  disconnectTestDb,
} from "../../helpers/superTestDb";
import {User} from "../../../models/user-model"

beforeAll(async()=>{
    await connectionTestDb();
})

afterEach(async()=>{
    await clearTestDb();
})

afterAll(async()=>{
    await disconnectTestDb();
})


