/**
 * RootLayout Component for UGA Bus Tracker
 * 
 * This component is the root layout for the UGA Bus Tracker application.
 * It defines the global settings, including the metadata (title, description, icon), 
 * and applies global styles such as the custom font ("Gaegu"). 
 * The layout also wraps the main content inside essential providers for:
 * - `TRPCProvider`: Handles API communication and manages server-side data fetching with tRPC.
 * - `AuthProvider`: Provides authentication context to the entire application.
 * - `Toaster`: Renders toast notifications for the application (likely for feedback messages to the user).
 * 
 * It uses the `gaegu` font loaded via `next/font/local` to apply custom styling to the app.
 */

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TRPCProvider } from "@/utils/trpc-provider";
import { gaegu } from "@/lib/font";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "UGA Bus Tracker",
  description: "Bet on UGA bus ETA",
  icons: {
    icon: "/uga_bus_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${gaegu.variable}`}>
      <body className={"font-gaegu"}>
        <TRPCProvider>
          <AuthProvider>{children}</AuthProvider>
        </TRPCProvider>
        <Toaster />
      </body>
    </html>
  );
}
