import mongoose, { Document, Schema } from "mongoose";

// How user works
interface IUser extends Document {
  username: string;
  password: string;
  points: number;
  profilePicture: string | null;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    points: {
      type: Number,
      default: 0,
    },
    profilePicture: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ensure profilePicture is always null when not explicitly set
UserSchema.pre("save", function (next) {
  if (this.isNew && this.profilePicture === undefined) {
    this.profilePicture = null;
  }
  next();
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
