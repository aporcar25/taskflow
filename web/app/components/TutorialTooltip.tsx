"use client";

import { useState, useEffect, useCallback } from "react";
import { completeTutorial } from "../../lib/api";

interface Step {
  targetId: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface TutorialTooltipProps {
  steps: Step[];
  pageKey: string;
}

export default function TutorialTooltip({ steps, pageKey }: TutorialTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const checkTutorial = () => {
      const userStr = localStorage.getItem("taskflow_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const fieldMap: Record<string, string> = {
          dashboard: 'tutorialDashboard',
          tasks: 'tutorialTasks',
          habits: 'tutorialHabits',
          stats: 'tutorialStats'
        };

        const completed = user[fieldMap[pageKey]];
        const onboardingCompleted = user.onboardingCompleted;

        if (!completed && onboardingCompleted) {
          // Delay to ensure elements are rendered
          setTimeout(() => setIsVisible(true), 1000);
        } else {
          setIsVisible(false);
        }
      }
    };

    checkTutorial();
    window.addEventListener('taskflow-user-updated', checkTutorial);
    return () => window.removeEventListener('taskflow-user-updated', checkTutorial);
  }, [pageKey]);

  const finish = useCallback(async () => {
    setIsVisible(false);
    try {
      await completeTutorial(pageKey);
    } catch (error) {
      console.error("Error completing tutorial:", error);
    }
  }, [pageKey]);

  const updateCoords = useCallback(() => {
    if (!isVisible || currentStep >= steps.length) return;

    const target = document.getElementById(steps[currentStep].targetId);
    if (target) {
      const rect = target.getBoundingClientRect();

      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });

      // Smooth scroll to target if not fully in view
      const viewportHeight = window.innerHeight;
      if (rect.top < 100 || rect.bottom > viewportHeight - 100) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      // If target not found, skip to next step or finish
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        finish();
      }
    }
  }, [currentStep, isVisible, steps, finish]);

  useEffect(() => {
    updateCoords();
    const timer = setTimeout(updateCoords, 500);
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, { passive: true });
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords);
      clearTimeout(timer);
    };
  }, [updateCoords]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finish();
    }
  };

  if (!isVisible || currentStep >= steps.length) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Target Highlight (Glow/Border) - Non-blocking */}
      <div
        className="absolute z-[150] rounded-2xl border-2 border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.4)] pointer-events-none transition-all duration-500 ease-in-out"
        style={{
          top: coords.top - 4,
          left: coords.left - 4,
          width: coords.width + 8,
          height: coords.height + 8,
        }}
      />

      {/* Tooltip Card - Fixed at bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-[200] w-72 bg-white dark:bg-dark-800 border border-lime-400/30 rounded-3xl shadow-2xl p-6 animate-slide-up flex flex-col pointer-events-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest">
              Tutorial {currentStep + 1}/{steps.length}
            </span>
          </div>
          <button onClick={finish} className="text-gray-400 hover:text-red-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-dark-900 dark:text-white leading-relaxed mb-6">
          {step.content}
        </p>

        <div className="flex gap-2">
          <button
            onClick={finish}
            className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold text-xs rounded-xl hover:text-dark-900 dark:hover:text-white transition-all"
          >
            Saltar
          </button>
          <button
            onClick={nextStep}
            className="flex-[2] py-3 bg-lime-400 text-dark-900 font-bold text-xs rounded-xl hover:bg-lime-300 transition-all shadow-lg shadow-lime-400/20"
          >
            {currentStep === steps.length - 1 ? "Entendido" : "Siguiente"}
          </button>
        </div>
      </div>
    </>
  );
}
