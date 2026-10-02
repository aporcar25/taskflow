import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "./components/ToastProvider";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "TaskFlow — Gestor de Productividad Personal",
  description:
    "Organiza tus tareas, construye hábitos y maximiza tu productividad con TaskFlow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                  document.documentElement.classList.remove('light')
                } else {
                  document.documentElement.classList.remove('dark')
                  document.documentElement.classList.add('light')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-dark-900 text-dark-900 dark:text-white antialiased transition-colors duration-200">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
