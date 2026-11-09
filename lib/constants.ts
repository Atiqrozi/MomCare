import type { AppointmentStatus, Role } from "./types";

export const roleLabels: Record<Role, string> = {
  PREGNANT_MOTHER: "Ibu hamil",
  MIDWIFE: "Bidan",
  DOCTOR: "Dokter",
  ADMIN: "Admin",
  CONTENT_EDITOR: "Editor konten",
  CLINICAL_REVIEWER: "Reviewer klinis",
};

export const appointmentLabels: Record<AppointmentStatus, string> = {
  scheduled: "Terjadwal",
  confirmed: "Dikonfirmasi",
  completed: "Selesai",
  missed: "Terlewat",
  cancelled: "Dibatalkan",
  rescheduled: "Dijadwalkan ulang",
};

export const clinicalDisclaimer =
  "MomCare mendukung layanan kesehatan dan bukan pengganti pemeriksaan atau keputusan tenaga kesehatan.";

export const dangerSignDisclaimer =
  "Bila mengalami gejala yang mengkhawatirkan, segera hubungi tenaga kesehatan atau layanan gawat darurat.";
