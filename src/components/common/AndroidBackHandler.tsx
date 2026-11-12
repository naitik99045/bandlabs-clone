"use client";

import React from "react";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";

export function AndroidBackHandler() {
  const { exitToastVisible } = useAndroidBackButton();

  if (!exitToastVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-200 ease-out"
    >
      <div className="bg-surface-2/95 border border-surface-border text-chalk text-xs font-mono px-4 py-2 rounded-sm shadow-xl flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-brand rounded-none" />
        <span>Press back again to exit</span>
      </div>
    </div>
  );
}
