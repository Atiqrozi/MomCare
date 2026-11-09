export type ActivePatient = { id: string; name: string; gestationalAge: string };
export const ACTIVE_PATIENT_STORAGE_KEY = "moment_active_patient";
export const ACTIVE_PATIENT_EVENT = "moment:active-patient-changed";

export function setActivePatient(patient: ActivePatient) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_PATIENT_STORAGE_KEY, JSON.stringify(patient));
  window.dispatchEvent(new CustomEvent<ActivePatient>(ACTIVE_PATIENT_EVENT, { detail: patient }));
}

export function clearActivePatient() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_PATIENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(ACTIVE_PATIENT_EVENT));
}

export function parseActivePatient(value: string | null): ActivePatient | null {
  if (!value) return null;
  try {
    const patient = JSON.parse(value) as Partial<ActivePatient>;
    if (typeof patient.id !== "string" || typeof patient.name !== "string") return null;
    return { id: patient.id, name: patient.name, gestationalAge: typeof patient.gestationalAge === "string" ? patient.gestationalAge : "Usia kehamilan belum dicatat" };
  } catch {
    return null;
  }
}
