import mongoose, { Document, Schema } from "mongoose";

interface IBet extends Document {
  userId: mongoose.Types.ObjectId;
  busName: string;
  stopName: string;
  expectedETA: string;
  actualETA: string | null;
  betChoice: "over" | "under";
  won: boolean;
  pointsAwarded: number;
  createdAt: Date;
}

const BetSchema = new Schema<IBet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    busName: {
      type: String,
      required: true,
    },
    stopName: {
      type: String,
      required: true,
    },
    expectedETA: {
      type: String,
      required: true,
    },
    actualETA: {
      type: String,
      default: null,
    },
    betChoice: {
      type: String,
      enum: ["over", "under"],
      required: true,
    },
    won: {
      type: Boolean,
      required: true,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add index for querying bets by userId and date
BetSchema.index({ userId: 1, createdAt: 1 });

// helper method to get bets by user for today
BetSchema.statics.getTodaysBetsByUser = async function (userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.find({
    userId,
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  });
};

export default mongoose.models.Bet || mongoose.model<IBet>("Bet", BetSchema);
