"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useStudioStore } from "@/stores/useStudioStore";

interface AndroidBackHandlerResult {
  exitToastVisible: boolean;
}

export function useAndroidBackButton(): AndroidBackHandlerResult {
  const {
    activeModal,
    setActiveModal,
    isCreateSheetOpen,
    setIsCreateSheetOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentView,
    setCurrentView,
    mobileNavTab,
    setMobileNavTab,
  } = useStudioStore();

  const [exitToastVisible, setExitToastVisible] = useState(false);
  const lastBackPressRef = useRef<number>(0);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBackAction = useCallback((): boolean => {
    // 1. Close active studio/creator modals
    if (activeModal !== null) {
      setActiveModal(null);
      return true;
    }

    // 2. Close quick creation bottom sheet
    if (isCreateSheetOpen) {
      setIsCreateSheetOpen(false);
      return true;
    }

    // 3. Close authentication modal
    if (isAuthModalOpen) {
      setIsAuthModalOpen(false);
      return true;
    }

    // 4. If in Studio DAW, navigate back to Projects Dashboard
    if (currentView === "studio") {
      setCurrentView("dashboard");
      return true;
    }

    // 5. If in Dashboard on a secondary tab, return to main Feed tab
    if (currentView === "dashboard" && mobileNavTab !== "feed") {
      setMobileNavTab("feed");
      return true;
    }

    // 6. At root (Feed tab or Landing page): 2-tap exit confirmation
    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      // Double tap confirmed within 2 seconds: Trigger native Android exit
      if (typeof window !== "undefined" && (window as any).AndroidNativeBridge?.exitApp) {
        (window as any).AndroidNativeBridge.exitApp();
        return true;
      }
      return false;
    }

    // First back press at root: show brief feedback toast
    lastBackPressRef.current = now;
    setExitToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setExitToastVisible(false);
    }, 2000);

    return true;
  }, [
    activeModal,
    setActiveModal,
    isCreateSheetOpen,
    setIsCreateSheetOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentView,
    setCurrentView,
    mobileNavTab,
    setMobileNavTab,
  ]);

  useEffect(() => {
    // Android Custom Event listener dispatched by MainActivity.java
    const onAndroidBackButton = (e: Event) => {
      e.preventDefault();
      handleBackAction();
    };

    // Keyboard Escape listener (for PC testing and Chromebooks)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }
        handleBackAction();
      }
    };

    window.addEventListener("androidBackButton", onAndroidBackButton as EventListener);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("androidBackButton", onAndroidBackButton as EventListener);
      window.removeEventListener("keydown", onKeyDown);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [handleBackAction]);

  return { exitToastVisible };
}
