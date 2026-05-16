import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors flex flex-col items-center justify-center p-4 relative overflow-hidden text-dark-900 dark:text-white">
      {/* Background decorative effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-400/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-lime-400/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative text-center space-y-8 max-w-md animate-fade-in">
        <div className="space-y-4">
          <div className="inline-block">
            <div className="text-lime-500 dark:text-lime-400 font-black text-9xl tracking-tighter animate-pulse-glow px-8 py-2 rounded-full">
              404
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Página <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-emerald-500 dark:from-lime-400 dark:to-emerald-400">no encontrada</span>
          </h1>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
          Lo sentimos, parece que te has perdido en el flujo. La página que buscas no existe o ha sido movida a otra dimensión.
        </p>

        <div className="pt-6 flex justify-center">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-lime-400 text-dark-900 font-bold hover:bg-lime-400/90 transition-all hover:shadow-2xl hover:shadow-lime-400/40 hover:-translate-y-1 active:translate-y-0"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </Link>
        </div>
      </div>

      {/* Subtle branding */}
      <div className="absolute bottom-12 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 rounded-md bg-lime-400 flex items-center justify-center">
          <svg className="w-3 h-3 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight text-dark-900 dark:text-white">
          Task<span className="text-lime-400">Flow</span>
        </span>
      </div>
    </div>
  );
}
