import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/utils/currency';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  name: string;
  specialty: string; // UI field, maps to DB 'specialization'
  phone: string;
  email: string;
  consultation_fee: number;
  created_at: string;
  updated_at: string;
}

const ProfessionalDoctors: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    consultation_fee: 0
  });

  // Fetch doctors from Supabase
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error('Error loading doctors: ' + error.message);
        throw error;
      }

      // Map DB 'specialization' to UI 'specialty'
      return (data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        specialty: d.specialization,
        phone: d.phone,
        email: d.email,
        consultation_fee: d.consultation_fee,
        created_at: d.created_at,
        updated_at: d.updated_at,
      })) as Doctor[];
    }
  });

  // Add doctor mutation
  const addDoctorMutation = useMutation({
    mutationFn: async (doctorData: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => {
      const payload = {
        name: doctorData.name,
        specialization: doctorData.specialty,
        phone: doctorData.phone,
        email: doctorData.email,
        consultation_fee: doctorData.consultation_fee,
      } as const;
      const { data, error } = await supabase
        .from('doctors')
        .insert([payload])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor added successfully');
      setShowAddForm(false);
      setFormData({ name: '', specialty: '', phone: '', email: '', consultation_fee: 0 });
    },
    onError: (error) => {
      toast.error('Error adding doctor: ' + error.message);
    }
  });

  // Update doctor mutation
  const updateDoctorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Doctor> }) => {
      const payload: Record<string, unknown> = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.specialty !== undefined) payload.specialization = data.specialty;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.email !== undefined) payload.email = data.email;
      if (data.consultation_fee !== undefined) payload.consultation_fee = data.consultation_fee;
      const { data: updatedData, error } = await supabase
        .from('doctors')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor updated successfully');
      setEditingDoctor(null);
    },
    onError: (error) => {
      toast.error('Error updating doctor: ' + error.message);
    }
  });

  // Delete doctor mutation
  const deleteDoctor = async (id: string) => {
    try {
      const { error } = await supabase.from('doctors').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor deleted successfully');
    } catch (error: any) {
      toast.error('Error deleting doctor: ' + (error?.message || 'Unknown error'));
    }
  };

