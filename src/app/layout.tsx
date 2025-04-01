import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TRPCProvider } from "@/utils/trpc-provider";

const gaegu = localFont({
  src: "../../public/fonts/Gaegu-Regular.ttf",
  variable: "--font-gaegu",
});

export const metadata: Metadata = {
  title: "UGA Bus Tracker",
  description: "Track UGA buses in real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${gaegu.variable} font-gaegu antialiased`}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
