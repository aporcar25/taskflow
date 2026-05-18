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
  const [tooltipOnTop, setTooltipOnTop] = useState(false);

  useEffect(() => {
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
      if (!completed) {
        // Delay to ensure elements are rendered
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    }
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

      // Auto-positioning logic: if in bottom half, show on top.
      const viewportHeight = window.innerHeight;
      const targetCenterY = rect.top + rect.height / 2;
      setTooltipOnTop(targetCenterY > viewportHeight / 2);

      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });

      // Smooth scroll to target if not fully in view
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
    // Re-check coords after a short delay for scroll
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
    <div className="fixed inset-0 z-[180] pointer-events-none">
      {/* Spotlight effect */}
      <div
        className="absolute z-[181] ring-[2000px] ring-black/60 rounded-lg transition-all duration-500 shadow-[0_0_0_4px_rgba(163,230,53,0.5)]"
        style={{
          top: coords.top - window.scrollY - 4,
          left: coords.left - window.scrollX - 4,
          width: coords.width + 8,
          height: coords.height + 8,
        }}
      />

      {/* Tooltip content */}
      <div
        className="absolute z-[182] pointer-events-auto bg-white dark:bg-dark-800 border border-lime-400/30 rounded-2xl shadow-2xl p-5 w-64 transition-all duration-500 animate-fade-in"
        style={{
          top: tooltipOnTop
            ? coords.top - window.scrollY - 16 // Position above
            : coords.top - window.scrollY + coords.height + 16, // Position below
          left: Math.max(16, Math.min(window.innerWidth - 272, coords.left - window.scrollX + coords.width / 2 - 128)),
          transform: tooltipOnTop ? 'translateY(-100%)' : 'none'
        }}
      >
        {/* Arrow */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-dark-800 border-lime-400/30 rotate-45 ${
            tooltipOnTop
              ? "-bottom-2 border-r border-b"
              : "-top-2 border-l border-t"
          }`}
        />

        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest">
            Tip {currentStep + 1}/{steps.length}
          </span>
          <button onClick={finish} className="text-gray-400 hover:text-red-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-dark-900 dark:text-white leading-relaxed mb-4">
          {step.content}
        </p>

        <div className="flex gap-2">
          <button
            onClick={finish}
            className="flex-1 py-2 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold text-xs rounded-xl hover:text-dark-900 dark:hover:text-white transition-all"
          >
            Saltar
          </button>
          <button
            onClick={nextStep}
            className="flex-[2] py-2 bg-lime-400 text-dark-900 font-bold text-xs rounded-xl hover:bg-lime-300 transition-all"
          >
            {currentStep === steps.length - 1 ? "Entendido" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}
