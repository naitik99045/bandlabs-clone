"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Dynamically import StudioLayout with ssr: false so Web Audio API and window context work seamlessly
const StudioLayout = dynamic(
  () => import("@/components/daw/StudioLayout").then((mod) => mod.StudioLayout),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-screen bg-surface-0 flex flex-col items-center justify-center gap-4">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent animate-spin rounded-none" />
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-mono tracking-widest uppercase text-chalk">
            INITIALIZING AUDIO ENGINE
          </span>
          <span className="text-[10px] font-mono text-slateMuted">
            44.1 kHz / 16-bit PCM Buffer
          </span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <ErrorBoundary>
      <StudioLayout />
    </ErrorBoundary>
  );
}
