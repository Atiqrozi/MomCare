import type { Metadata } from "next";
import "./globals.css";
import { ResponsiveTableLabels } from "@/components/responsive-table-labels";

export const metadata: Metadata = {
  title: "MomCare",
  description: "Pendamping digital untuk perjalanan kehamilan yang terhubung dengan layanan kesehatan.",
  icons: {
    icon: "/momcare-mark.png",
    shortcut: "/momcare-mark.png",
    apple: "/momcare-mark.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body><ResponsiveTableLabels />{children}</body>
    </html>
  );
}
