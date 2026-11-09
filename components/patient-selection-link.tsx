"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { setActivePatient } from "@/lib/active-patient";

export function PatientSelectionLink({
  patient,
  href,
  children,
  className,
  title,
}: {
  patient: { id: string; name: string; gestationalAge: string };
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return <Link href={href} title={title} className={className} onClick={() => setActivePatient(patient)}>{children}</Link>;
}
