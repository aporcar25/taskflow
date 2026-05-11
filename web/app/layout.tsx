import type { Metadata } from "next";
import "./globals.css";

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
      <body className="bg-dark-900 text-white antialiased">{children}</body>
    </html>
  );
}
