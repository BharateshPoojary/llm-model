"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import StoreProvider from "./StoreProvider";
import { ClerkProvider, SignedIn, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClerkProvider>
          <StoreProvider>
            <Toaster />

            {children}
          </StoreProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
