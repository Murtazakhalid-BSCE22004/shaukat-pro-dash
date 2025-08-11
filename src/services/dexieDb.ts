import Dexie, { Table } from 'dexie';

export interface Doctor {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  specialization: string;
  license_number?: string | null;
  department?: string | null;
  consultation_fee?: number;
  experience_years?: number;
  qualification?: string | null;
  address?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  opd_percentage?: number | null;
  lab_percentage?: number | null;
  ultrasound_percentage?: number | null;
  ecg_percentage?: number | null;
  ot_percentage?: number | null;
}

export interface Patient {
  id: string;
  patient_name: string;
  contact_number: string;
  doctor_name: string;
  opd_fee: number;
  lab_fee: number;
  ultrasound_fee: number;
  ecg_fee: number;
  created_at: string;
  updated_at: string;
}

export class AppDB extends Dexie {
  doctors!: Table<Doctor, string>;
  patients!: Table<Patient, string>;

  constructor() {
    super('AppDB');
    this.version(1).stores({
      doctors: 'id, name, is_active, specialization',
      patients: 'id, patient_name, contact_number, doctor_name, created_at'
    });
  }
}

export const db = new AppDB();
