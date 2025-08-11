import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Visit = Database['public']['Tables']['visits']['Row'];
type VisitInsert = Database['public']['Tables']['visits']['Insert'];
type VisitUpdate = Database['public']['Tables']['visits']['Update'];

export { type Visit, type VisitInsert, type VisitUpdate };

export const supabaseVisitsService = {
  // Get all visits
  async getAllVisits(): Promise<Visit[]> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .order('visit_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching visits:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get most recent visits
  async getRecentVisits(limit: number = 5): Promise<Visit[]> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent visits:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get visit by ID
  async getVisitById(id: string): Promise<Visit | null> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching visit:', error);
      throw error;
    }
    
    return data;
  },

  // Create new visit
  async createVisit(visit: VisitInsert): Promise<Visit> {
    const { data, error } = await supabase
      .from('visits')
      .insert([visit])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating visit:', error);
      throw error;
    }
    
    return data;
  },

  // Update visit
  async updateVisit(id: string, visit: VisitUpdate): Promise<Visit> {
    const { data, error } = await supabase
      .from('visits')
      .update(visit)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating visit:', error);
      throw error;
    }
    
    return data;
  },

  // Delete visit
  async deleteVisit(id: string): Promise<void> {
    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting visit:', error);
      throw error;
    }
  },

  // Get visits by date range
  async getVisitsByDateRange(startDate: string, endDate: string): Promise<Visit[]> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .gte('visit_date', startDate)
      .lte('visit_date', endDate)
      .order('visit_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching visits by date range:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get visits by date
  async getVisitsByDate(date: string): Promise<Visit[]> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('visit_date', date)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching visits by date:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get visits by doctor ID
  async getVisitsByDoctor(doctorId: string): Promise<Visit[]> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('visit_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching visits by doctor:', error);
      throw error;
    }
    
    return data || [];
  },

  // Search visits by patient name or contact
  async searchVisits(searchTerm: string): Promise<Visit[]> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .or(`patient_name.ilike.%${searchTerm}%,contact.ilike.%${searchTerm}%`)
      .order('visit_date', { ascending: false });
    
    if (error) {
      console.error('Error searching visits:', error);
      throw error;
    }
    
    return data || [];
  },

  // Subscribe to visits changes (real-time)
  subscribeToVisits(callback: (visits: Visit[]) => void) {
    const subscription = supabase
      .channel('visits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visits'
        },
        async () => {
          // Refetch all visits when there's a change
          const visits = await this.getAllVisits();
          callback(visits);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
};

// React Query hooks for visits
export const visitsQueries = {
  all: () => ['visits'] as const,
  list: () => [...visitsQueries.all(), 'list'] as const,
  detail: (id: string) => [...visitsQueries.all(), 'detail', id] as const,
  byDate: (date: string) => [...visitsQueries.all(), 'byDate', date] as const,
  byDoctor: (doctorId: string) => [...visitsQueries.all(), 'byDoctor', doctorId] as const,
  search: (term: string) => [...visitsQueries.all(), 'search', term] as const,
};
