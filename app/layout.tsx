import type { Metadata } from "next";
import "./globals.css";
import { ResponsiveTableLabels } from "@/components/responsive-table-labels";

export const metadata: Metadata = {
  title: "MomCare â€” Pendamping perjalanan kehamilan",
  description: "Pendamping digital untuk perjalanan kehamilan yang terhubung dengan layanan kesehatan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body><ResponsiveTableLabels />{children}</body>
    </html>
  );
}
