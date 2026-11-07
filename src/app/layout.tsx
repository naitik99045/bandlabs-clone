import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "BandLab Studio - Web DAW & Vocal Suite",
  description: "Free cloud music creation, vocal recording, AutoPitch, beat making, and mastering studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen w-screen overflow-hidden bg-studio-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
