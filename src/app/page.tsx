"use client";

import { motion, useSpring } from "framer-motion";
import throttle from "lodash/throttle";
import Link from "next/link";
import { useEffect, useState } from "react";
import connectMongoDB from "../../config/mongodb";
import Image from "next/image";
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

export default function Home() {
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

        <Link
          href="/auth"
          className="no-cursor group relative flex items-center gap-2 overflow-hidden rounded-lg border-2 border-green-500 bg-black/50 px-8 py-2 text-white transition-all hover:border-green-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/5 0 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="text-3xl">Join</span>
        </Link>
      </header>
      <div className="relative z-10 flex h-screen flex-col items-center justify-center">
        <h1 className="mb-8 text-center text-6xl font-bold text-white md:text-9xl">
          UGA Bus Tracker
        </h1>
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
          {/* <Link
            href="/auth"
            className="no-cursor group relative flex items-center gap-2 overflow-hidden rounded-lg border-2 border-green-500 bg-black/50 px-8 py-2 text-white transition-all hover:border-green-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-950/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="text-3xl">Join</span>
          </Link> */}
        </div>
      </div>
    </div>
  );
}
