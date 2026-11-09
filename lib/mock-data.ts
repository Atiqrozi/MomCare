import type { Appointment, Education, Journal, User } from "./types";

export const demoUser: User = {
  id: "demo-mother",
  fullName: "Alya Pratama",
  email: "alya@example.com",
  role: "PREGNANT_MOTHER",
  consentGranted: true,
};

export const demoAppointments: Appointment[] = [
  {
    id: "anc-001",
    scheduledAt: "2026-11-12T03:30:00.000Z",
    status: "confirmed",
    visitType: "Pemeriksaan rutin",
    providerName: "Bidan Rani",
    facilityName: "Klinik Sehat Ibu",
    reminderStatus: "pending",
  },
  {
    id: "anc-002",
    scheduledAt: "2026-12-10T02:00:00.000Z",
    status: "scheduled",
    visitType: "Kontrol kehamilan",
    providerName: "dr. Maya Sari",
    facilityName: "RS Harapan Bunda",
    reminderStatus: "sent",
  },
];

export const demoJournals: Journal[] = [
  { id: "j-001", entryDate: "2026-11-01T00:00:00.000Z", mood: "Baik", symptoms: ["Mudah lelah"], notes: "Beristirahat cukup hari ini." },
  { id: "j-002", entryDate: "2026-10-29T00:00:00.000Z", mood: "Tenang", symptoms: [], notes: "Minum air lebih banyak." },
];

export const demoEducation: Education[] = [
  {
    id: "edu-001",
    slug: "pemeriksaan-kehamilan-rutin",
    title: "Mengapa pemeriksaan kehamilan penting?",
    summary: "Kenali tujuan kunjungan ANC dan hal yang dapat dipersiapkan sebelum datang.",
    body: "Pemeriksaan kehamilan membantu ibu dan tenaga kesehatan memantau perjalanan kehamilan secara berkala. Catat pertanyaan dan keluhan yang ingin disampaikan saat kunjungan.",
    category: "Pemeriksaan kehamilan",
    sourceTitle: "Buku Kesehatan Ibu dan Anak",
    sourceVersion: "Edisi 2024",
    updatedAt: "2026-10-20T00:00:00.000Z",
  },
  {
    id: "edu-002",
    slug: "persiapan-menyusui",
    title: "Persiapan menyusui sejak masa kehamilan",
    summary: "Informasi dasar untuk membantu keluarga menyiapkan dukungan menyusui.",
    body: "Dukungan keluarga, informasi yang tepercaya, dan diskusi dengan tenaga kesehatan dapat membantu persiapan menyusui.",
    category: "ASI",
    sourceTitle: "Kementerian Kesehatan RI",
    sourceVersion: "Buku KIA",
    updatedAt: "2026-10-12T00:00:00.000Z",
  },
];

export const demoServices = [
  { id: "svc-001", slug: "poli-kandungan", name: "Poli Kandungan", department: "Kesehatan ibu", description: "Layanan pemeriksaan kehamilan oleh tenaga kesehatan.", hours: "Senin–Sabtu, 08.00–14.00", phone: "021-555-0188", location: "Gedung A, lantai 2" },
  { id: "svc-002", slug: "igd", name: "Instalasi Gawat Darurat", department: "Layanan 24 jam", description: "Layanan kegawatdaruratan rumah sakit.", hours: "24 jam setiap hari", phone: "021-555-0119", location: "Gedung utama" },
];
