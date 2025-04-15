"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [avatarSize, setAvatarSize] = useState(40);

  useEffect(() => {
    const updateSize = () => {
      setAvatarSize(window.innerWidth >= 640 ? 64 : 40);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className={`group relative flex items-center gap-2 sm:gap-4 overflow-hidden rounded-lg border-2 ${
        isCurrentUser ? "border-green-500" : "border-white"
      } bg-black/50 p-2 sm:p-4 text-white transition-all`}
    >
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-r  to-transparent opacity-0 transition-opacity `}
      />

      {/* Rank number */}
      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black text-lg sm:text-xl font-bold shrink-0">
        {rank}
      </div>

      {/* Profile image */}
      {user.profilePicture ? (
        <div className="h-10 w-10 sm:h-16 sm:w-16 shrink-0">
          <img
            src={user.profilePicture}
            alt={user.username}
            className="h-full w-full rounded-full object-cover border border-white"
          />
        </div>
      ) : (
        <div className="h-10 w-10 sm:h-16 sm:w-16 shrink-0 flex items-center justify-center">
          <ProfileAvatar
            username={user.username}
            size={avatarSize}
            className="border border-white"
          />
        </div>
      )}

      <div className="flex flex-1 items-center justify-between min-w-0">
        <h3 className="text-lg sm:text-2xl font-bold truncate pr-2">
          {user.username}
        </h3>
        <span
          className={`text-base sm:text-xl whitespace-nowrap ${
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

        const response = await fetch(
          user
            ? `/api/users/leaderboard?userId=${user.id}`
            : "/api/users/leaderboard"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const data = await response.json();

        let currentRank = 1;
        const formattedUsers = data.users.map((user: any, index: number) => {
          // if users have same points then list as same rank
          if (index > 0 && user.points < data.users[index - 1].points) {
            currentRank = index + 1;
          }

          return {
            id: user._id,
            username: user.username,
            points: user.points,
            profilePicture: user.profilePicture,
            rank: currentRank,
          };
        });

        setTopUsers(formattedUsers);

        // if there's a user and they're not in the top 5 find their rank
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
        } else {
          // clear currentUserRank if user is in top 5 or no user
          setCurrentUserRank(null);
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

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image
              src="/uga_bus_logo.png"
              alt="UGA Bus Logo"
              width={64}
              height={64}
              className="h-16 w-16 rounded-full border-2 border-white hover:border-blue-400 transition-colors"
            />
          </Link>
          <h1 className="hidden sm:block text-3xl font-bold text-white">
            Leaderboard
          </h1>
        </div>

        {user ? (
          <UserDropdown />
        ) : (
          <Link
            href="/auth"
            className="h-[48px] group relative flex items-center gap-2 overflow-hidden rounded-lg border-2 border-white bg-black/50 px-8 py-2 text-white transition-all hover:border-gray-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
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
                        <div className="flex items-center justify-center"></div>
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
