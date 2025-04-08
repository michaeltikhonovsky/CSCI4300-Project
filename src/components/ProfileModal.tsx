"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileAvatar from "./ProfileAvatar";
import { useToast } from "@/hooks/use-toast";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to compress an image before uploading
const compressImage = (
  file: File,
  maxWidth = 250,
  maxHeight = 250
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      // Create an image element
      const img = document.createElement("img") as HTMLImageElement;
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error("Failed to read file data"));
        return;
      }

      img.onload = () => {
        // Create canvas
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions to maintain aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image to canvas
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed image as Data URL
          const dataUrl = canvas.toDataURL(file.type, 0.7);
          resolve(dataUrl);
        } else {
          reject(new Error("Failed to create canvas context"));
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
  });
};

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state when user changes
  useEffect(() => {
    if (user) {
      console.log("ProfileModal: User data loaded", {
        username: user.username,
        profilePicture: user.profilePicture
          ? user.profilePicture.startsWith("data:image")
            ? "data:image (base64)"
            : user.profilePicture
          : null,
      });
      setUsername(user.username);
      setPreviewImage(user.profilePicture || null);
    }
  }, [user]);

  // Close modal with escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
      setError("File must be an image (JPEG, PNG, or GIF)");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB");
      return;
    }

    setError("");

    try {
      // Compress the image to reduce size
      setIsLoading(true);
      console.log("ProfileModal: Compressing image...");
      const compressedImage = await compressImage(file);
      console.log("ProfileModal: Image compressed successfully");

      // Set the compressed image as preview
      setPreviewImage(compressedImage);

      // Show success toast for profile picture update
      toast({
        title: "Profile Picture Updated",
        description:
          "Your profile picture has been updated. Save changes to apply.",
        variant: "success",
      });
    } catch (err) {
      console.error("ProfileModal: Error compressing image:", err);
      setError("Failed to process the image. Please try a different one.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    console.log("ProfileModal: Starting form submission");

    // Validate password if changing
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (password && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);

      const updates: {
        username?: string;
        password?: string;
        profilePicture?: string | null;
      } = {};

      const updatedFields = {
        username: false,
        password: false,
        profilePicture: false,
      };

      if (username !== user.username) {
        console.log(
          "ProfileModal: Username changed from",
          user.username,
          "to",
          username
        );
        updates.username = username;
        updatedFields.username = true;
      }

      if (password) {
        console.log("ProfileModal: Password changed");
        updates.password = password;
        updatedFields.password = true;
      }

      // Handle profile picture changes
      if (previewImage !== user.profilePicture) {
        console.log("ProfileModal: Profile picture changed");
        updates.profilePicture = previewImage;
        updatedFields.profilePicture = true;
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        console.log(
          "ProfileModal: Sending updates to server:",
          Object.keys(updates)
        );
        const updatedUser = await updateProfile(updates);
        console.log("ProfileModal: Update successful, received updated user:", {
          username: updatedUser.username,
          profilePicture: updatedUser.profilePicture
            ? updatedUser.profilePicture.startsWith("data:image")
              ? "data:image (base64)"
              : updatedUser.profilePicture
            : null,
        });

        // Show specific toasts based on what was updated
        if (updatedFields.username) {
          toast({
            title: "Username Updated",
            description: `Your username has been changed to ${username}`,
            variant: "success",
          });
        }

        if (updatedFields.password) {
          toast({
            title: "Password Updated",
            description: "Your password has been successfully changed",
            variant: "success",
          });
        }

        if (updatedFields.profilePicture) {
          toast({
            title: "Profile Picture Saved",
            description: previewImage
              ? "Your new profile picture has been saved"
              : "Your profile picture has been removed",
            variant: "success",
          });
        }
      } else {
        console.log("ProfileModal: No changes to save");
      }

      onClose();
    } catch (err) {
      console.error("ProfileModal: Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-lg rounded-lg border border-white bg-black/80 p-6 shadow-lg backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-500/20 p-3 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <div className="mb-6 flex flex-col items-center">
            <div
              className="group relative mb-2 h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-white"
              onClick={triggerFileInput}
            >
              {previewImage ? (
                <div className="relative h-full w-full">
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-sm font-medium text-white">
                      Change
                    </span>
                  </div>
                </div>
              ) : (
                <ProfileAvatar username={user.username} size={96} />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg, image/png, image/gif"
              className="hidden"
            />
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={triggerFileInput}
                className="text-sm text-white hover:text-gray-300 cursor-pointer"
              >
                Upload Photo
              </button>
              {previewImage && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    // Show toast for deleted profile picture
                    toast({
                      title: "Profile Picture Removed",
                      description:
                        "Your profile picture has been removed. Save changes to apply.",
                      variant: "default",
                    });
                  }}
                  className="text-sm text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Delete Photo
                </button>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 p-2.5 text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              New Password (leave blank to keep current)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 p-2.5 text-white placeholder-gray-400 focus:white focus:outline-none focus:ring-1 focus:white"
            />
          </div>

          {/* Confirm Password */}
          {password && (
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 p-2.5 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required={!!password}
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 rounded-lg border border-gray-600 bg-transparent px-4 py-2 text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-white px-4 py-2 text-black hover:bg-gray-300 disabled:opacity-70"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
