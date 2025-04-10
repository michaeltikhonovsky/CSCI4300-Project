import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../../../../config/mongodb";
import User from "@/models/User";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();

    const { id } = params;
    const { points } = await request.json();

    if (typeof points !== "number") {
      return NextResponse.json(
        { error: "Points must be a number" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // update points
    user.points += points;

    // dont allow negative points
    if (user.points < 0) {
      user.points = 0;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        points: user.points,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error updating user points:", error);
    return NextResponse.json(
      { error: "Failed to update user points" },
      { status: 500 }
    );
  }
}
