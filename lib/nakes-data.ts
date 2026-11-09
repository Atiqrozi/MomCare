export type NakesPatient = {
  id: string;
  name: string;
  nik: string;
  age: number;
  gestationalAge: string;
  trimester: "I" | "II" | "III";
  risk: "Rendah" | "Waspada" | "Tinggi";
  nextVisit: string;
  phone: string;
  bloodPressure: string;
};

export const nakesPatients: NakesPatient[] = [
  { id: "p0", name: "Alya Pratama", nik: "3273014509950001", age: 30, gestationalAge: "32 minggu", trimester: "III", risk: "Waspada", nextVisit: "04 Nov 2026", phone: "0812-3456-7890", bloodPressure: "130/85" },
  { id: "p1", name: "Siti Rahma", nik: "3273015208920002", age: 34, gestationalAge: "28 minggu", trimester: "III", risk: "Tinggi", nextVisit: "04 Nov 2026", phone: "0813-4455-6677", bloodPressure: "145/95" },
  { id: "p2", name: "Dewi Lestari", nik: "3273016309000003", age: 26, gestationalAge: "21 minggu", trimester: "II", risk: "Rendah", nextVisit: "06 Nov 2026", phone: "0857-1234-5678", bloodPressure: "110/70" },
  { id: "p3", name: "Nur Aisyah", nik: "3273014807880004", age: 38, gestationalAge: "36 minggu", trimester: "III", risk: "Tinggi", nextVisit: "05 Nov 2026", phone: "0821-9087-6543", bloodPressure: "150/100" },
  { id: "p4", name: "Maya Sari", nik: "3273017003970005", age: 29, gestationalAge: "12 minggu", trimester: "I", risk: "Rendah", nextVisit: "12 Nov 2026", phone: "0819-2222-3344", bloodPressure: "115/75" },
];

export const todayAppointments = [
  { time: "08:00", patient: "Siti Rahma", type: "ANC Kunjungan 5", status: "Menunggu", risk: "Tinggi" },
  { time: "09:30", patient: "Alya Pratama", type: "ANC Kunjungan 8", status: "Dikonfirmasi", risk: "Waspada" },
  { time: "11:00", patient: "Dewi Lestari", type: "Konsultasi", status: "Dikonfirmasi", risk: "Rendah" },
  { time: "13:30", patient: "Nur Aisyah", type: "Pemantauan risiko", status: "Menunggu", risk: "Tinggi" },
];

export const educationMaterials = [
  ["Tanda bahaya kehamilan trimester III", "Kehamilan berisiko", "12 menit"],
  ["Pencegahan dan pemantauan preeklampsia", "Kehamilan berisiko", "8 menit"],
  ["Persiapan persalinan dan IMD", "Persiapan persalinan", "10 menit"],
  ["Nutrisi seimbang untuk ibu hamil", "Nutrisi", "6 menit"],
];
