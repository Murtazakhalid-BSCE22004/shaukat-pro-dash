import { Doctor, FeeCategory, Visit } from "@/types";

export const FEE_CATEGORIES: FeeCategory[] = [
  "OPD",
  "LAB",
  "OT",
  "ULTRASOUND",
  "ECG",
];

export function safeNumber(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? 0));
  return isFinite(n) ? n : 0;
}

export function computeVisitSplit(visit: Visit, doctor: Doctor) {
  const doctorByCat: Partial<Record<FeeCategory, number>> = {};
  const hospitalByCat: Partial<Record<FeeCategory, number>> = {};

  for (const cat of FEE_CATEGORIES) {
    const fee = safeNumber(visit.fees[cat] ?? 0);
    const pct = safeNumber(doctor.percentages[cat] ?? 0) / 100;
    const docAmt = fee * pct;
    const hospAmt = fee - docAmt;
    doctorByCat[cat] = docAmt;
    hospitalByCat[cat] = hospAmt;
  }

  const doctorTotal = FEE_CATEGORIES.reduce((s, c) => s + safeNumber(doctorByCat[c] ?? 0), 0);
  const hospitalTotal = FEE_CATEGORIES.reduce((s, c) => s + safeNumber(hospitalByCat[c] ?? 0), 0);
  const feeTotal = FEE_CATEGORIES.reduce((s, c) => s + safeNumber(visit.fees[c] ?? 0), 0);

  return { doctorByCat, hospitalByCat, doctorTotal, hospitalTotal, feeTotal };
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}

export function isoDateOnly(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}
