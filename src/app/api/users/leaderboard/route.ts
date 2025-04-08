import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../../../config/mongodb";
import User from "@/models/User";

// User type definition for TypeScript
interface UserDocument {
  _id: string;
  username: string;
  points: number;
  profilePicture: string | null;
}

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Get current user ID from query parameter if it exists
    const url = new URL(request.url);
    const currentUserId = url.searchParams.get("userId");

    // Fetch top 50 users sorted by points (descending)
    const users = await User.find({})
      .select("username points profilePicture")
      .sort({ points: -1 })
      .limit(50)
      .lean();

    let currentUserData = null;

    // If we have a current user ID and they're not in the top 5
    if (currentUserId) {
      // Get the top 5 users
      const top5UserIds = users
        .slice(0, 5)
        .map((user: any) => user._id.toString());

      // If current user is not in top 5, find them and their rank
      if (!top5UserIds.includes(currentUserId)) {
        const currentUser: any = await User.findById(currentUserId)
          .select("username points profilePicture")
          .lean();

        if (currentUser) {
          // Count how many users have more points to determine rank
          const usersWithMorePoints = await User.countDocuments({
            points: { $gt: currentUser.points },
          });

          // Rank is users with more points + 1
          currentUserData = {
            ...currentUser,
            rank: usersWithMorePoints + 1,
          };
        }
      }
    }

    return NextResponse.json({
      users,
      currentUser: currentUserData,
    });
  } catch (error) {
    console.error("Error in leaderboard API:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
