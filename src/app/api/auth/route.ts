import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../../config/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import { createToken } from "@/utils/auth";

// Connect to database
export async function POST(request: NextRequest) {
  try {
    const { username, password, action } = await request.json();

    await connectMongoDB();

    if (action === "signup") {
      // check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 409 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        username,
        password: hashedPassword,
        points: 0,
      });

      // generate JWT token
      const token = await createToken({
        userId: newUser._id.toString(),
        username: newUser.username,
      });

      return NextResponse.json(
        {
          message: "User created successfully",
          user: {
            id: newUser._id,
            username: newUser.username,
            points: newUser.points,
            profilePicture: newUser.profilePicture,
          },
          token,
        },
        { status: 201 }
      );
    } else if (action === "signin") {
      // find user
      const user = await User.findOne({ username });
      if (!user) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      // verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      // generate JWT token
      const token = await createToken({
        userId: user._id.toString(),
        username: user.username,
      });

      return NextResponse.json(
        {
          message: "Login successful",
          user: {
            id: user._id,
            username: user.username,
            points: user.points,
            profilePicture: user.profilePicture,
          },
          token,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// profile updates
export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    console.log("Profile update request received for user:", userId);
    console.log("Updates requested:", Object.keys(updates));

    await connectMongoDB();

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found in database:", user.username);

    // update fields only if provided
    if (updates.username && updates.username !== user.username) {
      // check if new username is already taken
      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 409 }
        );
      }
      console.log(
        "Updating username from",
        user.username,
        "to",
        updates.username
      );
      user.username = updates.username;
    }

    if (updates.password) {
      console.log("Updating password for user:", user.username);
      user.password = await bcrypt.hash(updates.password, 10);
    }

    // handle profile picture updates
    if (updates.profilePicture !== undefined) {
      console.log("Profile picture update requested");

      // if it's null remove the profile picture
      if (updates.profilePicture === null) {
        console.log("Resetting profile picture to null");
        user.profilePicture = null;
      } else {
        if (updates.profilePicture.startsWith("data:image/")) {
          const base64Data = updates.profilePicture.split(",")[1];
          if (base64Data) {
            const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
            const sizeInMB = sizeInBytes / (1024 * 1024);

            console.log("Profile picture size:", sizeInMB.toFixed(2), "MB");

            if (sizeInMB > 2) {
              console.log("Profile picture too large, rejecting");
              return NextResponse.json(
                { error: "Image size must be less than 2MB" },
                { status: 400 }
              );
            }

            console.log(
              "Storing new profile picture (base64 length:",
              base64Data.length,
              ")"
            );
            user.profilePicture = updates.profilePicture;
          }
        } else {
          console.log(
            "Invalid image format provided:",
            updates.profilePicture.substring(0, 30) + "..."
          );
          return NextResponse.json(
            { error: "Invalid image format" },
            { status: 400 }
          );
        }
      }
    }

    // save updated user
    console.log("Saving user updates to database...");
    await user.save();
    console.log("User updated successfully in database");

    const responseUser = {
      id: user._id,
      username: user.username,
      points: user.points,
      profilePicture: user.profilePicture,
    };

    console.log(
      "Sending updated user data to client:",
      JSON.stringify({
        ...responseUser,
        profilePicture: responseUser.profilePicture
          ? `[Profile picture (${
              responseUser.profilePicture.length > 100
                ? "base64 data"
                : responseUser.profilePicture
            })]`
          : null,
      })
    );

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: responseUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
