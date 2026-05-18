"use client";

import { useState } from "react";

interface OnboardingModalProps {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      localStorage.setItem("onboardingCompleted", "true");
      onComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-dark-900/90 backdrop-blur-xl animate-fade-in p-4">
      <div className="bg-dark-800 border border-white/10 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
        {/* Progress indicator */}
        <div className="flex h-1.5 w-full bg-white/5">
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              className={`h-full transition-all duration-500 ${
                i + 1 <= step ? "bg-lime-400" : "bg-transparent"
              }`}
              style={{ width: `${100 / totalSteps}%` }}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col p-8 sm:p-12">
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up">
            {step === 1 && (
              <>
                <div className="w-20 h-20 rounded-2xl bg-lime-400 flex items-center justify-center mb-8 shadow-lg shadow-lime-400/20">
                  <svg className="w-10 h-10 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
                  Bienvenido a <span className="text-lime-400">TaskFlow</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                  Tu nuevo aliado para organizar tu vida, construir hábitos y alcanzar tus metas con eficiencia.
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-lime-400/10 flex items-center justify-center mb-8 text-lime-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Gestiona tus Tareas</h2>
                <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                  Crea tareas, asígnales prioridades y establece fechas límite. Organízalas por categorías para mantener todo bajo control.
                </p>
              </>
            )}

            {step === 3 && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-lime-400/10 flex items-center justify-center mb-8 text-lime-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Construye Hábitos</h2>
                <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                  Define rutinas diarias y visualiza tus rachas. La constancia es la clave para transformar tu estilo de vida.
                </p>
              </>
            )}

            {step === 4 && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-lime-400/10 flex items-center justify-center mb-8 text-lime-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Dashboard y Estadísticas</h2>
                <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                  Mide tu rendimiento con gráficos intuitivos y un resumen diario. Analiza tu progreso para ser cada día mejor.
                </p>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-12">
            <button
              onClick={prevStep}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                step === 1
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              disabled={step === 1}
            >
              Anterior
            </button>
            <div className="flex gap-2">
              {[...Array(totalSteps)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i + 1 === step ? "bg-lime-400 w-6" : "bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextStep}
              className="px-8 py-3 rounded-xl bg-lime-400 text-dark-900 font-bold text-sm hover:bg-lime-300 transition-all hover:shadow-lg hover:shadow-lime-400/20"
            >
              {step === totalSteps ? "Empezar ahora" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
