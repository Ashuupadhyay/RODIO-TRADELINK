import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("AI Service: MongoDB connected");
  } catch (error) {
    console.error("AI Service: MongoDB connection failed");
    console.error(error.message);
    process.exit(1);
  }
}