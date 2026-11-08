import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "BandLab Studio Pro - Multi-Track Audio Workstation",
  description: "High-precision cloud DAW with AutoPitch vocal suite, 16-step beat machine, and zero-latency audio export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen w-screen overflow-hidden bg-surface-0 text-chalk antialiased">
        {children}
      </body>
    </html>
  );
}
