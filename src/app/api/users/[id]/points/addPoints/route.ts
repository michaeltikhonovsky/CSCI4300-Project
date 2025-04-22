import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../../../../../config/mongodb";
import User from "@/models/User";
import { verifyToken, extractTokenFromHeader } from "@/utils/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const payload = await verifyToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Don't do anything until connected to the DB
    await connectMongoDB();

    const { id } = params;
    const { points, reason } = await request.json();

    // Ensure caller has permission (either same user or admin)
    if (payload.userId !== id) {
      return NextResponse.json(
        { error: "Unauthorized to modify points for this user" },
        { status: 403 }
      );
    }

    // Points have to be a numerical value
    if (typeof points !== "number") {
      return NextResponse.json(
        { error: "Points must be a number" },
        { status: 400 }
      );
    }

    // Wait for user to
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log the points transaction
    console.log(
      `Adding ${points} points to user ${user.username} for: ${
        reason || "unspecified"
      }`
    );

    // Update points
    user.points += points;

    // Don't allow negative points
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
