import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalesCoach AI - Coach de Ventas con Inteligencia Artificial",
  description:
    "Mejora tu rendimiento en ventas con análisis inteligente de llamadas y recomendaciones personalizadas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
