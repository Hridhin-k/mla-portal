"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { getTourSteps } from "@/lib/admin/help-content";
import { AdminHelpPanel } from "@/components/admin/help-panel";

type OnboardingState = {
  role: string;
  fullName: string | null;
  onboardingCompleted: boolean;
  isAdmin: boolean;
};

type AdminGuideContextValue = {
  ready: boolean;
  isAdmin: boolean;
  fullName: string | null;
  openHelp: () => void;
  startTour: () => void;
};

const AdminGuideContext = createContext<AdminGuideContextValue | null>(null);

export function useAdminGuide() {
  const ctx = useContext(AdminGuideContext);
  if (!ctx) {
    throw new Error("useAdminGuide must be used within AdminGuideProvider");
  }
  return ctx;
}

export function AdminGuideProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const driverRef = useRef<Driver | null>(null);
  const tourStartedRef = useRef(false);
  const autoOpenedHelpRef = useRef(false);

  const markComplete = useCallback(async () => {
    await fetch("/api/admin/onboarding", { method: "PATCH" });
    setState((prev) => (prev ? { ...prev, onboardingCompleted: true } : prev));
  }, []);

  const startTour = useCallback(() => {
    if (!state) return;

    driverRef.current?.destroy();

    const steps = getTourSteps(state.isAdmin).map(
      (step): DriveStep => ({
        element: step.element,
        popover: {
          title: step.popover.title,
          description: step.popover.description,
          side: step.popover.side,
          align: step.popover.align,
        },
      })
    );

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayColor: "rgba(12, 30, 66, 0.72)",
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: "admin-driver-popover",
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Finish",
      steps,
      onDestroyed: () => {
        driverRef.current = null;
        void markComplete();
      },
    });

    driverRef.current = driverObj;
    driverObj.drive();
  }, [state, markComplete]);

  useEffect(() => {
    fetch("/api/admin/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setState({
          role: data.role,
          fullName: data.fullName,
          onboardingCompleted: data.onboardingCompleted,
          isAdmin: data.isAdmin,
        });
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !state || state.onboardingCompleted || tourStartedRef.current) return;
    tourStartedRef.current = true;
    const timer = window.setTimeout(() => {
      if (window.innerWidth >= 1024) {
        startTour();
      } else {
        autoOpenedHelpRef.current = true;
        setHelpOpen(true);
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [ready, state, startTour]);

  const handleHelpOpenChange = useCallback(
    (open: boolean) => {
      setHelpOpen(open);
      if (!open && autoOpenedHelpRef.current) {
        autoOpenedHelpRef.current = false;
        void markComplete();
      }
    },
    [markComplete]
  );

  const value: AdminGuideContextValue = {
    ready,
    isAdmin: state?.isAdmin ?? false,
    fullName: state?.fullName ?? null,
    openHelp: () => setHelpOpen(true),
    startTour,
  };

  return (
    <AdminGuideContext.Provider value={value}>
      {children}
      <AdminHelpPanel
        open={helpOpen}
        onOpenChange={handleHelpOpenChange}
        isAdmin={state?.isAdmin ?? false}
        onStartTour={startTour}
      />
    </AdminGuideContext.Provider>
  );
}
