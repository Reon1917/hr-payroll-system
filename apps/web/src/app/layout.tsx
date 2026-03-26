import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body-face",
  weight: ["400", "500", "600", "700"],
});

const thaiFallbackFont = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-thai-face",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HR Payroll System",
  description: "Minimal HR payroll management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${bodyFont.variable} ${thaiFallbackFont.variable} min-h-full bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
