require("dotenv").config();

const mongoose = require("mongoose");

const { syncUsers } = require("./userDataSync");

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI;

async function run() {
  try {
    console.log("================================");
    console.log("USER DATA SYNC START");
    console.log("================================");

    if (!MONGO_URI) {
      throw new Error(
        "MONGO_URI / MONGODB_URI .env me nahi mila"
      );
    }

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB Connected");

    await syncUsers();

    await mongoose.disconnect();

    console.log("MongoDB Disconnected");

    console.log("================================");
    console.log("SYNC FINISHED");
    console.log("================================");

    process.exit(0);
  } catch (error) {
    console.error("================================");
    console.error("SYNC FAILED");
    console.error("================================");

    console.error(
      error.response?.data ||
      error.message ||
      error
    );

    process.exit(1);
  }
}

run();