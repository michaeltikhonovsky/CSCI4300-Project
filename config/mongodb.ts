import mongoose from "mongoose";

const connectMongoDB = async (): Promise<void> => {
  try {
    if (typeof window !== "undefined") {
      return;
    }

    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error(
        "MONGODB_URI is not defined in environment variables. Please check your .env file."
      );
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }

    // Try to connect to MongoDB
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", (error as Error).message);
    console.error("Full error:", error);
  }
};

export default connectMongoDB;
