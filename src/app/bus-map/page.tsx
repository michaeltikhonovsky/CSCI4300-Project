"use client";

import BusMap from "@/components/BusMap";
import Link from "next/link";

export default function BusMapPage() {
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

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <img
              src="/uga_bus_logo.png"
              alt="UGA Bus Logo"
              className="h-16 w-16 rounded-full object-cover border-2  hover:border-blue-400 transition-colors"
            />
          </Link>
          <h1 className="text-4xl font-bold text-white">UGA Bus Tracker</h1>
        </div>

        <div className="flex justify-center w-full">
          <div className="w-full max-w-6xl">
            <BusMap />
          </div>
        </div>
      </div>
    </div>
  );
}
