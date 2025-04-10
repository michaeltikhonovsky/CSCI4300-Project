import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../../config/mongodb";
import User from "@/models/User";
import Bet from "@/models/Bet";
import { Types } from "mongoose";

interface BetRequest {
  userId: string;
  busName: string;
  stopName: string;
  expectedETA: string;
  actualETA: string;
  betChoice: "over" | "under";
  won: boolean;
}

// fetch current bet count for user
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // fetch daily bets for user
    // @ts-ignore
    const todaysBets = await Bet.getTodaysBetsByUser(userId);
    const betCount = todaysBets.length;
    const remaining = 5 - betCount;

    return NextResponse.json({
      betCount,
      remaining,
      canBet: remaining > 0,
      bets: todaysBets,
    });
  } catch (error) {
    console.error("Error checking bet count:", error);
    return NextResponse.json(
      { error: "Failed to check bet count" },
      { status: 500 }
    );
  }
}

// process bet
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      busName,
      stopName,
      expectedETA,
      actualETA,
      betChoice,
      won,
    }: BetRequest = await request.json();

    if (
      !userId ||
      !betChoice ||
      !busName ||
      !stopName ||
      !expectedETA ||
      !actualETA
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // check if user has reached daily limit
    // @ts-ignore
    const todaysBets = await Bet.getTodaysBetsByUser(userId);
    if (todaysBets.length >= 5) {
      return NextResponse.json(
        { error: "Daily bet limit reached (5/5)" },
        { status: 403 }
      );
    }

    const pointsAwarded = won ? 100 : 0;

    if (won) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      user.points += pointsAwarded;
      await user.save();
    }

    // create new bet record
    const bet = await Bet.create({
      userId: new Types.ObjectId(userId),
      busName,
      stopName,
      expectedETA,
      actualETA,
      betChoice,
      won,
      pointsAwarded,
    });

    const newCount = todaysBets.length + 1;
    const remaining = 5 - newCount;

    return NextResponse.json({
      success: true,
      won,
      betCount: newCount,
      remaining,
      canBet: remaining > 0,
      pointsAwarded,
      bet: {
        id: bet._id,
        busName: bet.busName,
        stopName: bet.stopName,
        expectedETA: bet.expectedETA,
        actualETA: bet.actualETA,
        betChoice: bet.betChoice,
        won: bet.won,
        createdAt: bet.createdAt,
      },
    });
  } catch (error) {
    console.error("Error processing bet:", error);
    return NextResponse.json(
      { error: "Failed to process bet" },
      { status: 500 }
    );
  }
}
