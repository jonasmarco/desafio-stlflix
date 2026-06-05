import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { WebVitalsReporter } from "@/app/_components/web-vitals-reporter";
import "./globals.css";

export const metadata: Metadata = {
  title: "STLFLIX Pedido Bridge",
  description: "Frontend Next.js integrado a um fluxo n8n para captura de pedidos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          storageKey="stlflix-theme:v1"
        >
          <WebVitalsReporter />
          {children}
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
