"use client";

import { motion, useSpring } from "framer-motion";
import throttle from "lodash/throttle";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import connectMongoDB from "../../config/mongodb";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import ProfileModal from "@/components/ProfileModal";
import ProfileAvatar from "@/components/ProfileAvatar";

const BouncyCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const cursorX = useSpring(0, { damping: 50, stiffness: 1000, mass: 0.1 });
  const cursorY = useSpring(0, { damping: 50, stiffness: 1000, mass: 0.1 });
  const cursorSize = useSpring(24, { damping: 25, stiffness: 200, mass: 0.1 });

  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      setIsVisible(true);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    }, 16);

    const handleLinkHover = throttle((e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isHovering = !!target.closest("a");
      setIsHovered(isHovering);
      cursorSize.set(isHovering ? 48 : 24);
    }, 100);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleLinkHover);
    window.addEventListener("mousedown", () => setIsPressed(true));
    window.addEventListener("mouseup", () => setIsPressed(false));

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleLinkHover);
      window.removeEventListener("mousedown", () => setIsPressed(true));
      window.removeEventListener("mouseup", () => setIsPressed(false));
    };
  }, [cursorX, cursorY, cursorSize]);

  return (
    <motion.div
      className="pointer-events-none fixed z-[60] rounded-full bg-white"
      initial={{ translateX: "-50%", translateY: "-50%" }}
      style={{
        mixBlendMode: "difference",
        x: cursorX,
        y: cursorY,
        opacity: isVisible ? 1 : 0,
        width: cursorSize,
        height: cursorSize,
      }}
      animate={{
        scale: isPressed ? 0.8 : 1,
        translateX: "-50%",
        translateY: "-50%",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    />
  );
};

// User dropdown component
const UserDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && user.profilePicture) {
      setProfilePic(user.profilePicture);
    } else {
      setProfilePic(null);
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="no-cursor flex items-center gap-2 rounded-lg border-2 border-white bg-black/50 px-4 py-2 text-white transition-all hover:border-gray-200 hover:shadow-white"
        >
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white">
            {profilePic ? (
              <img
                src={profilePic}
                alt={user.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <ProfileAvatar username={user.username} size={32} />
            )}
          </div>
          <span className="font-medium">{user.username}</span>
          <span className="ml-1 text-white">{user.points} pts</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-white bg-black/90 py-1 shadow-lg backdrop-blur-sm">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsOpen(false);
              }}
              className="no-cursor flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-green-900/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Edit Profile
            </button>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="no-cursor flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-red-900/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {isModalOpen && (
        <ProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default function Home() {
  const { user } = useAuth();
  connectMongoDB();

  return (
    <div className="no-cursor relative min-h-screen w-full overflow-hidden bg-black">
      <BouncyCursor />

      {/* Background Image with Vignette */}
      <div className="fixed inset-0">
        <img
          src="/uga_campus_art.png"
          alt="UGA Campus"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"></div>
      </div>

      {/* Main Content */}
      <header className="flex items-center justify-between px-4 py-2">
        <Image
          className="h-16 w-16 rounded-full border-2 border-white"
          src="/uga_bus_logo.png"
          alt="UGA Bus Logo"
          width={100}
          height={100}
        />

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
      <div className="relative z-10 flex h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-center text-6xl font-bold text-white md:text-9xl">
          UGA Bus Tracker
        </h1>
        <p className="text-center text-white mb-8 text-2xl">
          Bet on whether or not the UGA buses will arrive on time!
        </p>
        <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-3">
          <Link
            href="/bus-map"
            className="no-cursor group relative flex items-center gap-2 overflow-hidden rounded-lg border-2 border-blue-500 bg-black/50 px-8 py-2 text-white transition-all hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-950/50 to-transparent transition-opacity group-hover:opacity-100" />
            <span className="text-3xl">Bet on the Buses</span>
          </Link>
          <Link
            href="/leaderboard"
            className="no-cursor group relative flex items-center gap-2 overflow-hidden rounded-lg border-2 border-purple-500 bg-black/50 px-8 py-2 text-white transition-all hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-950/50 to-transparent transition-opacity group-hover:opacity-100" />
            <span className="text-3xl">Leaderboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
