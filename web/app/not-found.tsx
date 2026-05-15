import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md animate-fade-in">
        <div className="text-lime-400 font-bold text-9xl">404</div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Página no encontrada</h1>
        <p className="text-gray-400">
          Oops, parece que te has perdido en el espacio. La página que estás buscando no existe o ha sido movida.
        </p>
        <div className="pt-4 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-lime-400 text-dark-900 font-bold hover:bg-lime-400/90 transition-all hover:shadow-lg hover:shadow-lime-400/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
