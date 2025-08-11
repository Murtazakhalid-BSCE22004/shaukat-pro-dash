import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Doctor = Database['public']['Tables']['doctors']['Row'];
type DoctorInsert = Database['public']['Tables']['doctors']['Insert'];
type DoctorUpdate = Database['public']['Tables']['doctors']['Update'];

export { type Doctor, type DoctorInsert, type DoctorUpdate };

export const supabaseDoctorsService = {
  // Get all doctors
  async getAllDoctors(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get active doctors only
  async getActiveDoctors(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching active doctors:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get doctor by ID
  async getDoctorById(id: string): Promise<Doctor | null> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching doctor:', error);
      throw error;
    }
    
    return data;
  },

  // Create new doctor
  async createDoctor(doctor: DoctorInsert): Promise<Doctor> {
    console.log('supabaseDoctorsService.createDoctor called with:', doctor);
    
    const { data, error } = await supabase
      .from('doctors')
      .insert([doctor])
      .select()
      .single();
    
    console.log('Supabase response:', { data, error });
    
    if (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
    
    console.log('Doctor created successfully:', data);
    return data;
  },

  // Update doctor
  async updateDoctor(id: string, doctor: DoctorUpdate): Promise<Doctor> {
    const { data, error } = await supabase
      .from('doctors')
      .update(doctor)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating doctor:', error);
      throw error;
    }
    
    return data;
  },

  // Delete doctor
  async deleteDoctor(id: string): Promise<void> {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting doctor:', error);
      throw error;
    }
  },

  // Search doctors by name or specialization
  async searchDoctors(searchTerm: string): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error searching doctors:', error);
      throw error;
    }
    
    return data || [];
  },

  // Subscribe to doctors changes (real-time)
  subscribeToDoctors(callback: (doctors: Doctor[]) => void) {
    const subscription = supabase
      .channel('doctors_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctors'
        },
        async () => {
          // Refetch all doctors when there's a change
          const doctors = await this.getAllDoctors();
          callback(doctors);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
