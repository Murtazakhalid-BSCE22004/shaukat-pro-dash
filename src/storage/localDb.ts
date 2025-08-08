import { Doctor, Visit } from "@/types";
import { isoDateOnly } from "@/utils/finance";

const DOCTORS_KEY = "sih_doctors";
const VISITS_KEY = "sih_visits";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const db = {
  // Doctors
  getDoctors(): Doctor[] {
    return read<Doctor[]>(DOCTORS_KEY, []);
  },
  saveDoctor(doc: Doctor) {
    const all = db.getDoctors();
    const idx = all.findIndex((d) => d.id === doc.id);
    if (idx === -1) all.push(doc);
    else all[idx] = doc;
    write(DOCTORS_KEY, all);
  },
  deleteDoctor(id: string) {
    const all = db.getDoctors().filter((d) => d.id !== id);
    write(DOCTORS_KEY, all);
  },

  // Visits
  getVisits(): Visit[] {
    return read<Visit[]>(VISITS_KEY, []);
  },
  addVisit(v: Visit) {
    const all = db.getVisits();
    all.push(v);
    write(VISITS_KEY, all);
  },
  getVisitsByDate(date: string): Visit[] {
    const target = isoDateOnly(date);
    return db.getVisits().filter((v) => isoDateOnly(v.date) === target);
  },
};
