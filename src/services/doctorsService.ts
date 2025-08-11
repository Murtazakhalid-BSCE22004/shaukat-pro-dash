import { db } from './dexieDb';

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
}

export type DoctorInsert = Omit<Doctor, 'id' | 'created_at' | 'updated_at'> & { id?: string };
export type DoctorUpdate = Partial<Doctor>;

export const doctorsService = {
  // Get all doctors
  async getAllDoctors() {
    return await db.doctors.orderBy('name').toArray();
  },

  // Get active doctors only
  async getActiveDoctors() {
    return await db.doctors.where('is_active').equals(true).sortBy('name');
  },

  // Get doctor by ID
  async getDoctorById(id: string) {
    return await db.doctors.get(id);
  },

  // Create new doctor
  async createDoctor(doctor: DoctorInsert) {
    const now = new Date().toISOString();
    const id = doctor.id || crypto.randomUUID();
    await db.doctors.add({ ...doctor, id, is_active: true, created_at: now, updated_at: now });
    return await db.doctors.get(id);
  },

  // Update doctor
  async updateDoctor(id: string, doctor: DoctorUpdate) {
    const updated_at = new Date().toISOString();
    await db.doctors.update(id, { ...doctor, updated_at });
    return await db.doctors.get(id);
  },

  // Delete doctor
  async deleteDoctor(id: string) {
    await db.doctors.delete(id);
  },

  // Search doctors by name or specialization
  async searchDoctors(searchTerm: string) {
    const term = searchTerm.toLowerCase();
    return await db.doctors
      .filter(
        d =>
          d.name.toLowerCase().includes(term) ||
          (d.specialization && d.specialization.toLowerCase().includes(term))
      )
      .toArray();
  },

  // Subscribe to doctors changes
  subscribeToDoctors(callback: (doctors: Doctor[]) => void) {
    // Dexie doesn't have real-time subscriptions, but you can use hooks or events if needed.
    // For now, return a no-op unsubscribe.
    return () => {};
  }
};

// React Query hooks for doctors
export const doctorsQueries = {
  all: () => ['doctors'] as const,
  list: () => [...doctorsQueries.all(), 'list'] as const,
  active: () => [...doctorsQueries.all(), 'active'] as const,
  detail: (id: string) => [...doctorsQueries.all(), 'detail', id] as const,
  search: (term: string) => [...doctorsQueries.all(), 'search', term] as const,
};
