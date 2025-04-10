import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../../../config/mongodb";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectMongoDB();

    const { id } = await context.params;

    const user = await User.findById(id).select(
      "username points profilePicture"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        points: user.points,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
