import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MomCare — Pendamping perjalanan kehamilan",
  description: "Pendamping digital untuk perjalanan kehamilan yang terhubung dengan layanan kesehatan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
