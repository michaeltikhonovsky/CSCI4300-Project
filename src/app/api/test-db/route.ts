import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../../config/mongodb";

export async function GET() {
  try {
    console.log("Test-DB route: Testing MongoDB connection");

    // Try connecting to MongoDB
    await connectMongoDB();

    // If we get here, it connected successfully
    return NextResponse.json(
      {
        success: true,
        message: "MongoDB connection successful",
        env: {
          hasMongoUri: !!process.env.MONGODB_URI,
          mongoUriPrefix: process.env.MONGODB_URI
            ? process.env.MONGODB_URI.substring(0, 20) + "..."
            : "undefined",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Test-DB route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        env: {
          hasMongoUri: !!process.env.MONGODB_URI,
          mongoUriPrefix: process.env.MONGODB_URI
            ? process.env.MONGODB_URI.substring(0, 20) + "..."
            : "undefined",
          availableEnvVars: Object.keys(process.env)
            .filter((key) => !key.includes("SECRET") && !key.includes("KEY"))
            .join(", "),
        },
      },
      { status: 500 }
    );
  }
}
