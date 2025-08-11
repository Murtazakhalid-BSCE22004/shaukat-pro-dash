import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export { type Patient, type PatientInsert, type PatientUpdate };

export const supabasePatientsService = {
  // Get all patients
  async getAllPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get most recent patients (by created_at)
  async getRecentPatients(limit: number = 5): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent patients:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get patient by ID
  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
    
    return data;
  },

  // Create new patient
  async createPatient(patient: PatientInsert): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert([patient])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
    
    return data;
  },

  // Update patient
  async updatePatient(id: string, patient: PatientUpdate): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update(patient)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
    
    return data;
  },

  // Delete patient
  async deletePatient(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  },

  // Get patients by date range (using created_at)
  async getPatientsByDateRange(startDate: string, endDate: string): Promise<Patient[]> {
    console.log('Supabase query - startDate:', startDate, 'endDate:', endDate);
    
    // First, let's check if there are any patients at all
    const { data: allPatients, error: allError } = await supabase
      .from('patients')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (allError) {
      console.error('Error fetching sample patients:', allError);
    } else {
      console.log('Sample of all patients created_at:', allPatients?.map(p => p.created_at));
    }
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .gte('created_at', startDate)
      .lt('created_at', endDate)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching patients by date range:', error);
      throw error;
    }
    
    console.log('Supabase query result - patients found:', data?.length || 0);
    
    // Debug: Log a few sample patients to see their created_at values
    if (data && data.length > 0) {
      console.log('Sample patients created_at:', data.slice(0, 3).map(p => ({
        id: p.id,
        patient_name: p.patient_name,
        created_at: p.created_at
      })));
    }
    
    return data || [];
  },

  // Get patients by doctor name
  async getPatientsByDoctor(doctorName: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_name', doctorName)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching patients by doctor:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get patients by optional filters
  async getPatientsByFilters({
    doctorName,
    startDate,
    endDate,
    searchTerm,
  }: {
    doctorName?: string;
    startDate?: string; // ISO
    endDate?: string;   // ISO
    searchTerm?: string;
  }): Promise<Patient[]> {
    let query = supabase
      .from('patients')
      .select('*');

    if (doctorName && doctorName !== 'all') {
      query = query.eq('doctor_name', doctorName);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lt('created_at', endDate);
    }
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim();
      query = query.or(`patient_name.ilike.%${term}%,contact_number.ilike.%${term}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients by filters:', error);
      throw error;
    }

    return data || [];
  },

  // Search patients by patient name or contact
  async searchPatients(searchTerm: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`patient_name.ilike.%${searchTerm}%,contact_number.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get patients count
  async getPatientsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error fetching patients count:', error);
      throw error;
    }
    
    return count || 0;
  },

  // Get revenue statistics
  async getRevenueStats() {
    const { data, error } = await supabase
      .from('patients')
      .select('opd_fee, lab_fee, ultrasound_fee, ecg_fee');
    
    if (error) {
      console.error('Error fetching revenue stats:', error);
      throw error;
    }

    const stats = {
      totalOPD: 0,
      totalLab: 0,
      totalUltrasound: 0,
      totalECG: 0,
      totalRevenue: 0
    };

    data?.forEach(patient => {
      stats.totalOPD += patient.opd_fee || 0;
      stats.totalLab += patient.lab_fee || 0;
      stats.totalUltrasound += patient.ultrasound_fee || 0;
      stats.totalECG += patient.ecg_fee || 0;
    });

    stats.totalRevenue = stats.totalOPD + stats.totalLab + stats.totalUltrasound + stats.totalECG;
    
    return stats;
  },

  // Subscribe to patients changes (real-time)
  subscribeToPatients(callback: (patients: Patient[]) => void) {
    const subscription = supabase
      .channel('patients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients'
        },
        async () => {
          // Refetch all patients when there's a change
          const patients = await this.getAllPatients();
          callback(patients);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
};

// React Query hooks for patients
export const patientsQueries = {
  all: () => ['patients'] as const,
  list: () => [...patientsQueries.all(), 'list'] as const,
  detail: (id: string) => [...patientsQueries.all(), 'detail', id] as const,
  byDoctor: (doctorName: string) => [...patientsQueries.all(), 'byDoctor', doctorName] as const,
  search: (term: string) => [...patientsQueries.all(), 'search', term] as const,
};
