import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Nestra AI",
  description:
    "Platform analisis dan prediksi potensi angin berbasis AI untuk pembangunan Pembangkit Listrik Tenaga Bayu (PLTB) di Indonesia.",
  keywords: "PLTB, angin, energi terbarukan, wind energy, analisis, prediksi, Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        
          <TooltipProvider>{children}</TooltipProvider>
        
      </body>
    </html>
  );
}

