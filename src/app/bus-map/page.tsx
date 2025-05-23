"use client";
// Main Page
import BusMap, { BetContext } from "@/components/BusMap";
import BusBetWidget from "@/components/BusBetWidget";
import UserDropdown from "@/components/UserDropdown";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useState } from "react";

interface ETAInfo {
  duration: string;
  distance: string;
  vehicleName: string;
  stopName: string;
  directions?: any;
  busId?: string | null;
}

export default function BusMapPage() {
  const { user } = useAuth();
  const [etaInfo, setEtaInfo] = useState<ETAInfo | null>(null);

  return (
    <div className="relative min-h-screen w-full bg-black overflow-y-auto">
      {/* Background Image with Vignette */}
      <div className="fixed inset-0 z-0">
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
            Bus Tracker
          </h1>
        </div>

        {user ? (
          <UserDropdown />
        ) : (
          <Link
            href="/auth?redirect=/bus-map"
            className="h-[48px] group relative flex items-center gap-2 overflow-hidden rounded-lg border-2 border-white bg-black/50 px-8 py-2 text-white transition-all hover:border-gray-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-950/5 0 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="text-3xl">Join</span>
          </Link>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-4 sm:p-8">
        <BetContext.Provider value={{ etaInfo, setEtaInfo }}>
          <div className="flex flex-col md:flex-row gap-8 justify-center w-full">
            <div className="w-full md:w-7/12">
              <BusMap />
            </div>
            <div className="w-full md:w-5/12">
              <BusBetWidget />
            </div>
          </div>
        </BetContext.Provider>
      </main>
    </div>
  );
}
