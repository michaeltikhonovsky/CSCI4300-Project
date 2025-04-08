"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  username: string;
  points: number;
  profilePicture?: string | null;
};

type ProfileUpdates = {
  username?: string;
  password?: string;
  profilePicture?: string | null;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: ProfileUpdates) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          return data.user;
        }
      }
      return null;
    } catch (error) {
      console.error("AuthContext: Error fetching user data:", error);
      return null;
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log("AuthContext: Loading user from localStorage", {
            id: userData.id,
            username: userData.username,
            hasProfilePicture: !!userData.profilePicture,
            profilePictureType: userData.profilePicture
              ? userData.profilePicture.startsWith("data:image")
                ? "base64"
                : "path"
              : "none",
          });

          // Set user initially from localStorage
          setUser(userData);

          // Fetch fresh user data to ensure we have the latest points and other info
          try {
            const response = await fetch(`/api/users/${userData.id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                const freshUserData = {
                  ...userData,
                  ...data.user,
                };

                console.log("AuthContext: Updated user data from API", {
                  username: freshUserData.username,
                  points: freshUserData.points,
                });

                // Update user state with fresh data
                setUser(freshUserData);

                // Update localStorage with fresh data
                localStorage.setItem("user", JSON.stringify(freshUserData));
              }
            }
          } catch (fetchError) {
            console.error(
              "AuthContext: Error fetching fresh user data:",
              fetchError
            );
            // Keep using the localStorage data if fetch fails
          }
        } catch (error) {
          console.error("AuthContext: Error parsing user data:", error);
          localStorage.removeItem("user");
        }
      } else {
        console.log("AuthContext: No stored user found in localStorage");
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Periodically update user points every 30 seconds
  useEffect(() => {
    if (!user) return;

    const updateUserPoints = async () => {
      const freshUserData = await fetchUserData(user.id);
      if (freshUserData) {
        const updatedUser = {
          ...user,
          points: freshUserData.points,
        };

        // Only update if points have changed
        if (user.points !== freshUserData.points) {
          console.log("AuthContext: Updated user points", {
            oldPoints: user.points,
            newPoints: freshUserData.points,
          });

          // Update user state with new points
          setUser(updatedUser);

          // Update localStorage
          try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              userData.points = freshUserData.points;
              localStorage.setItem("user", JSON.stringify(userData));
            }
          } catch (error) {
            console.error(
              "AuthContext: Error updating user in localStorage:",
              error
            );
          }
        }
      }
    };

    // Initial update
    updateUserPoints();

    // Set up interval for periodic updates
    const intervalId = setInterval(updateUserPoints, 30000); // 30 seconds

    // Cleanup interval on unmount or when user changes
    return () => clearInterval(intervalId);
  }, [user]);

  const login = (userData: User) => {
    // Ensure userData has all required fields
    const validatedUser: User = {
      id: userData.id,
      username: userData.username,
      points: userData.points || 0,
      profilePicture: userData.profilePicture || null,
    };

    console.log("AuthContext: User logging in", {
      id: validatedUser.id,
      username: validatedUser.username,
      hasProfilePicture: !!validatedUser.profilePicture,
      profilePictureType: validatedUser.profilePicture
        ? validatedUser.profilePicture.startsWith("data:image")
          ? "base64"
          : "path"
        : "none",
    });

    setUser(validatedUser);

    try {
      localStorage.setItem("user", JSON.stringify(validatedUser));
      console.log("AuthContext: User data saved to localStorage");
    } catch (error) {
      console.error("AuthContext: Error saving user to localStorage:", error);

      if (
        validatedUser.profilePicture &&
        validatedUser.profilePicture.startsWith("data:image")
      ) {
        console.log(
          "AuthContext: Attempting to save user without profile picture"
        );
        const userWithoutPicture = {
          ...validatedUser,
          profilePicture: null,
        };
        try {
          localStorage.setItem("user", JSON.stringify(userWithoutPicture));
          console.log("AuthContext: User saved without profile picture");
        } catch (storageError) {
          console.error(
            "AuthContext: Failed to save user even without profile picture:",
            storageError
          );
        }
      }
    }
  };

  const logout = () => {
    console.log("AuthContext: User logging out");
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateProfile = async (updates: ProfileUpdates): Promise<User> => {
    if (!user) {
      throw new Error("No user logged in");
    }

    console.log("AuthContext: Updating profile", {
      userId: user.id,
      updateFields: Object.keys(updates),
      hasProfilePictureUpdate: "profilePicture" in updates,
      profilePictureType: updates.profilePicture
        ? updates.profilePicture.startsWith("data:image")
          ? "base64"
          : "path"
        : "null",
    });

    try {
      const response = await fetch("/api/auth", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          updates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("AuthContext: Server returned error:", data.error);
        throw new Error(data.error || "Failed to update profile");
      }

      // Create updated user with all fields to ensure nothing is lost
      const updatedUser = {
        ...user,
        ...data.user,
      };

      console.log("AuthContext: Profile updated successfully", {
        username: updatedUser.username,
        hasProfilePicture: !!updatedUser.profilePicture,
        profilePictureType: updatedUser.profilePicture
          ? updatedUser.profilePicture.startsWith("data:image")
            ? "base64"
            : "path"
          : "none",
      });

      // Update user state with new data
      setUser(updatedUser);

      // Store updated user in localStorage
      try {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("AuthContext: Updated user saved to localStorage");
      } catch (error) {
        console.error(
          "AuthContext: Error saving updated user to localStorage:",
          error
        );

        // If saving fails, try without the profile picture
        if (
          updatedUser.profilePicture &&
          updatedUser.profilePicture.startsWith("data:image")
        ) {
          console.log(
            "AuthContext: Attempting to save user without profile picture"
          );
          const userWithoutPicture = {
            ...updatedUser,
            profilePicture: null,
          };
          try {
            localStorage.setItem("user", JSON.stringify(userWithoutPicture));
            console.log("AuthContext: User saved without profile picture");
          } catch (storageError) {
            console.error(
              "AuthContext: Failed to save user even without profile picture:",
              storageError
            );
          }
        }
      }

      return updatedUser;
    } catch (error) {
      console.error("AuthContext: Error updating profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
