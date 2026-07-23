import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

const connectionTestDb = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (error) {
    throw error;
    console.log("500 some thing went wrong while connecting testDb", error);
  }
};

const clearTestDb = async () => {
  const collections: any = mongoose.connection.collection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

const disconnectTestDb = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

export{
    connectionTestDb,
    clearTestDb,
    disconnectTestDb
}