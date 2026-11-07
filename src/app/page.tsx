"use client";

import dynamic from "next/dynamic";

// Dynamically import the Studio layout with ssr: false so Web Audio API and window context work seamlessly
const StudioLayout = dynamic(
  () => import("@/components/daw/StudioLayout").then((mod) => mod.StudioLayout),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-screen bg-studio-950 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-studio-accent border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">
          Initializing BandLab Studio...
        </span>
      </div>
    ),
  }
);

export default function HomePage() {
  return <StudioLayout />;
}
