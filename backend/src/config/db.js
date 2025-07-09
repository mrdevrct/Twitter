import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("Connected to DB Successfully");
  } catch (error) {
    console.log("Faild Connected to DB error:", error);
    process.exit(1);
  }
};
