import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TRPCProvider } from "@/utils/trpc-provider";
import { gaegu } from "@/lib/font";

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
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
