"use client";

import Sidebar from "../components/Sidebar";
import QuickSummary from "../components/QuickSummary";
import OnboardingModal from "../components/OnboardingModal";
import PomodoroTimer from "../components/PomodoroTimer";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { completeOnboarding } from "../../lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("taskflow_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (!user.onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await completeOnboarding();
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Even if API fails, we close the modal to not block the user,
      // though they might see it again on next login if it didn't save.
      setShowOnboarding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isPomodoroOpen={isPomodoroOpen}
        setIsPomodoroOpen={setIsPomodoroOpen}
      />

      <PomodoroTimer
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
      />

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 z-30 flex items-center justify-between px-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center">
            <svg className="w-4 h-4 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-dark-900 dark:text-white">TaskFlow</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="md:ml-64 min-h-screen pt-16 md:pt-0 pb-10 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
      {!isDashboard && <QuickSummary />}
    </div>
  );
}
