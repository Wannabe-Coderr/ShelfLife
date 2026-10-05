const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;

async function connectDB() {
  const useMemoryDB = process.env.USE_MEMORY_DB === "true" || !process.env.MONGODB_URI;

  if (useMemoryDB) {
    memoryServer = await MongoMemoryServer.create({
      binary: { version: "7.0.14" },
      replSet: { count: 1 }
    });

    await mongoose.connect(memoryServer.getUri(), {
      dbName: "shelflife"
    });

    console.log("Connected to in-memory MongoDB");
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "shelflife"
  });

  console.log("Connected to MongoDB");
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
