require("dotenv").config();

const mongoose = require("mongoose");

const {
  syncBusinesses,
} = require("./businessDataSync");

const MONGO_URI = process.env.MONGO_URI;

const run = async () => {
  try {
    console.log("================================");
    console.log("BUSINESS DATA SYNC START");
    console.log("================================");

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB Connected");

    await syncBusinesses();

    await mongoose.disconnect();

    console.log("MongoDB Disconnected");

    console.log("================================");
    console.log("SYNC FINISHED");
    console.log("================================");

  } catch (error) {
    console.error("SYNC ERROR:");
    console.error(error.message);

    process.exit(1);
  }
};

run();