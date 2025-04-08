"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import connectMongoDB from "../../../config/mongodb";
import ProfileAvatar from "@/components/ProfileAvatar";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import UserDropdown from "@/components/UserDropdown";

type LeaderboardUser = {
  id: string;
  username: string;
  points: number;
  profilePicture: string | null;
  rank: number;
};

const LeaderboardItem = ({
  rank,
  user,
  isCurrentUser = false,
}: {
  rank: number;
  user: LeaderboardUser;
  isCurrentUser?: boolean;
}) => {
  return (
    <div
      className={`group relative flex items-center gap-4 overflow-hidden rounded-lg border-2 ${
        isCurrentUser ? "border-green-500" : "border-white"
      } bg-black/50 p-4 text-white transition-all`}
    >
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-r  to-transparent opacity-0 transition-opacity `}
      />

      {/* Rank number */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xl font-bold">
        {rank}
      </div>

      {/* Profile image */}
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.username}
          className="h-16 w-16 rounded-full object-cover border border-white"
        />
      ) : (
        <ProfileAvatar
          username={user.username}
          size={64}
          className="border border-white"
        />
      )}

      <div className="flex flex-1 items-center justify-between">
        <h3 className="text-2xl font-bold">{user.username}</h3>
        <span
          className={`text-xl ${
            isCurrentUser ? "text-green-400" : "text-white"
          }`}
        >
          {user.points} points
        </span>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] =
    useState<LeaderboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);

        // Fetch the top users
        const response = await fetch("/api/users/leaderboard");
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const data = await response.json();

        // Format the top users data
        const formattedUsers = data.users.map((user: any, index: number) => ({
          id: user._id,
          username: user.username,
          points: user.points,
          profilePicture: user.profilePicture,
          rank: index + 1,
        }));

        setTopUsers(formattedUsers);

        // If there's a logged-in user and they're not in the top 5,
        // find their rank
        if (
          user &&
          !formattedUsers
            .slice(0, 5)
            .some((u: LeaderboardUser) => u.id === user.id)
        ) {
          const currentUserData = data.currentUser;
          if (currentUserData) {
            setCurrentUserRank({
              id: currentUserData._id,
              username: currentUserData.username,
              points: currentUserData.points,
              profilePicture: currentUserData.profilePicture,
              rank: currentUserData.rank,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background Image with Vignette */}
      <div className="fixed inset-0">
        <img
          src="/uga_campus_art.png"
          alt="UGA Campus"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"></div>
      </div>

      <header className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <Link href="/">
            <img
              src="/uga_bus_logo.png"
              alt="UGA Bus Logo"
              className="h-16 w-16 rounded-full object-cover border-2 border-white hover:border-blue-400 transition-colors"
            />
          </Link>
          <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
        </div>

        {user ? (
          <UserDropdown />
        ) : (
          <Link
            href="/auth"
            className="no-cursor h-[48px] group relative flex items-center gap-2 overflow-hidden rounded-lg border-2 border-white bg-black/50 px-8 py-2 text-white transition-all hover:border-gray-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-950/5 0 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="text-3xl">Join</span>
          </Link>
        )}
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col p-8 pt-20">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          {isLoading ? (
            <div className="text-center text-white text-xl">
              Loading leaderboard...
            </div>
          ) : (
            <>
              {topUsers.length > 0 ? (
                <>
                  {/* Display top 5 users */}
                  {topUsers.slice(0, 5).map((userData) => (
                    <LeaderboardItem
                      key={userData.id}
                      rank={userData.rank}
                      user={userData}
                      isCurrentUser={user?.id === userData.id}
                    />
                  ))}

                  {/* Display current user if not in top 5 */}
                  {currentUserRank && (
                    <>
                      {topUsers.length >= 5 && (
                        <div className="flex items-center justify-center py-2">
                          <div className="h-1 w-16 bg-gray-700 rounded-full"></div>
                        </div>
                      )}
                      <LeaderboardItem
                        rank={currentUserRank.rank}
                        user={currentUserRank}
                        isCurrentUser={true}
                      />
                    </>
                  )}
                </>
              ) : (
                <div className="text-center text-white text-xl">
                  No users found
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
