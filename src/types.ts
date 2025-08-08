export type FeeCategory = "OPD" | "LAB" | "OT" | "ULTRASOUND" | "ECG";

export interface Doctor {
  id: string;
  name: string;
  percentages: Record<FeeCategory, number>; // 0-100
  createdAt: string; // ISO date
}

export interface Visit {
  id: string;
  patientName: string;
  contact: string;
  doctorId: string;
  date: string; // ISO date
  fees: Partial<Record<FeeCategory, number>>; // numeric amounts per category
}
