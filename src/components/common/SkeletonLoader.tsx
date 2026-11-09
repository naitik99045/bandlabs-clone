"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-surface-2 border border-surface-border animate-pulse ${className}`}
    />
  );
}

export function TrackCardSkeleton() {
  return (
    <div className="bg-surface-1 border border-surface-border p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3 h-3" />
          <Skeleton className="w-28 h-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-10 h-6" />
          <Skeleton className="w-7 h-7" />
          <Skeleton className="w-7 h-7" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-full h-2" />
        </div>
        <div className="space-y-1">
          <Skeleton className="w-12 h-3" />
          <Skeleton className="w-full h-2" />
        </div>
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="p-3 bg-surface-1 border border-surface-border flex items-center justify-between">
      <div className="space-y-1.5">
        <Skeleton className="w-36 h-4" />
        <Skeleton className="w-48 h-3" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="w-14 h-7" />
        <Skeleton className="w-7 h-7" />
      </div>
    </div>
  );
}
