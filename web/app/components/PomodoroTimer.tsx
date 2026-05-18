"use client";

import { useState, useEffect, useCallback } from "react";

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PomodoroTimer({ isOpen, onClose }: PomodoroTimerProps) {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const savedWork = localStorage.getItem("pomodoroWork");
    const savedBreak = localStorage.getItem("pomodoroBreak");
    if (savedWork) setWorkDuration(parseInt(savedWork));
    if (savedBreak) setBreakDuration(parseInt(savedBreak));

    // Request notification permission on mount if not yet asked
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!hasStarted) {
      setTimeLeft((isBreak ? breakDuration : workDuration) * 60);
    }
  }, [workDuration, breakDuration, isBreak, hasStarted]);

  const notify = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (!isBreak) {
        setIsBreak(true);
        setTimeLeft(breakDuration * 60);
        notify("¡Tiempo de trabajo terminado!", "Tómate un descanso de 5 minutos.");
      } else {
        setIsBreak(false);
        setTimeLeft(workDuration * 60);
        notify("¡Descanso terminado!", "Vuelve al trabajo. ¡Tú puedes!");
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, workDuration, breakDuration, notify]);

  const toggleTimer = () => {
    if (!isActive) setHasStarted(true);
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setHasStarted(false);
    setTimeLeft(workDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleWorkDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setWorkDuration(val);
    localStorage.setItem("pomodoroWork", val.toString());
  };

  const handleBreakDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setBreakDuration(val);
    localStorage.setItem("pomodoroBreak", val.toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 z-[150] w-72 bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
      <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isBreak ? "bg-emerald-400" : "bg-lime-400"}`} />
          <h3 className="text-sm font-bold text-dark-900 dark:text-white uppercase tracking-wider">
            {isBreak ? "Descanso" : "Trabajo"}
          </h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-dark-900 dark:hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-8 flex flex-col items-center">
        <div className="text-5xl font-black text-dark-900 dark:text-white mb-8 font-mono tracking-tighter">
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              isActive
                ? "bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-dark-900 dark:hover:text-white"
                : "bg-lime-400 text-dark-900 hover:bg-lime-300 shadow-lg shadow-lime-400/20"
            }`}
          >
            {isActive ? "Pausar" : (hasStarted ? "Reanudar" : "Empezar")}
          </button>
          <button
            onClick={resetTimer}
            className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-dark-900 dark:hover:text-white transition-colors"
            title="Reiniciar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-5 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Trabajo</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={workDuration}
                onChange={handleWorkDurationChange}
                className="w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm text-dark-900 dark:text-white outline-none focus:ring-1 focus:ring-lime-400/50"
              />
              <span className="text-[10px] text-gray-500">min</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Descanso</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={breakDuration}
                onChange={handleBreakDurationChange}
                className="w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm text-dark-900 dark:text-white outline-none focus:ring-1 focus:ring-lime-400/50"
              />
              <span className="text-[10px] text-gray-500">min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
