import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR Payroll System",
  description: "Frontend for the HR payroll platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
