import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseDoctorsService, type Doctor } from '@/services/supabaseDoctorsService';
import { supabasePatientsService, type Patient } from '@/services/supabasePatientsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const Patients: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPatient, setNewPatient] = useState({
    patient_name: '',
    contact_number: '',
    doctor_name: '',
    opd_fee: 0,
    lab_fee: 0,
    ultrasound_fee: 0,
    ecg_fee: 0
  });

  // Fetch active doctors for dropdown
  const { data: doctors = [], isLoading: isDoctorsLoading } = useQuery<Doctor[]>({
    queryKey: ['active-doctors'],
    queryFn: supabaseDoctorsService.getActiveDoctors,
  });

  // Fetch patients
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', { selectedDoctor, startDate, endDate, searchTerm }],
    queryFn: async () => {
      const range = {
        startISO: startDate ? new Date(`${startDate}T00:00:00.000Z`).toISOString() : undefined,
        endISO: endDate ? new Date(`${endDate}T23:59:59.999Z`).toISOString() : undefined,
      };
      return await supabasePatientsService.getPatientsByFilters({
        doctorName: selectedDoctor !== 'all' ? selectedDoctor : undefined,
        startDate: range.startISO,
        endDate: range.endISO,
        searchTerm,
      });
    },
  });

  // Create or update patient mutation
  const savePatientMutation = useMutation({
    mutationFn: async (payload: typeof newPatient) => {
      if (editingId) {
        return await supabasePatientsService.updatePatient(editingId, payload);
      }
      return await supabasePatientsService.createPatient(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(editingId ? 'Patient updated successfully' : 'Patient added successfully');
      resetForm();
      setShowAddForm(false);
    },
    onError: (error) => {
      toast.error('Error saving patient: ' + error);
    }
  });

  // Delete patient
  const deletePatient = async (id: string) => {
    try {
      await supabasePatientsService.deletePatient(id);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient deleted successfully');
      if (editingId === id) {
        resetForm();
        setShowAddForm(false);
      }
    } catch (error) {
      toast.error('Error deleting patient');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNewPatient({
      patient_name: '',
      contact_number: '',
      doctor_name: '',
      opd_fee: 0,
      lab_fee: 0,
      ultrasound_fee: 0,
      ecg_fee: 0
    });
  };

  const filteredPatients = patients;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.patient_name.trim()) {
      toast.error('Patient name is required');
      return;
    }
    if (!newPatient.contact_number.trim()) {
      toast.error('Contact number is required');
      return;
    }
    if (!newPatient.doctor_name.trim()) {
      toast.error('Doctor name is required');
      return;
    }
    savePatientMutation.mutate(newPatient);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setNewPatient(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Patients Management</h1>
        <Button onClick={() => { resetForm(); setShowAddForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Label>Doctor</Label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="all">All Doctors</option>
                {isDoctorsLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  doctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>{doc.name}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Patient' : 'Add New Patient'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Patient Name</Label>
                  <Input
                    value={newPatient.patient_name}
                    onChange={(e) => handleInputChange('patient_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input
                    value={newPatient.contact_number}
                    onChange={(e) => handleInputChange('contact_number', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Doctor Name</Label>
                  <select
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                    value={newPatient.doctor_name}
                    onChange={(e) => handleInputChange('doctor_name', e.target.value)}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {isDoctorsLoading ? (
                      <option disabled>Loading...</option>
                    ) : (
                      doctors.map((doc) => (
                        <option key={doc.id} value={doc.name}>{doc.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <Label>OPD Fee</Label>
                  <Input
                    type="number"
                    value={newPatient.opd_fee}
                    onChange={(e) => handleInputChange('opd_fee', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <Label>Lab Fee</Label>
                  <Input
                    type="number"
                    value={newPatient.lab_fee}
                    onChange={(e) => handleInputChange('lab_fee', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Ultrasound Fee</Label>
                  <Input
                    type="number"
                    value={newPatient.ultrasound_fee}
                    onChange={(e) => handleInputChange('ultrasound_fee', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>ECG Fee</Label>
                  <Input
                    type="number"
                    value={newPatient.ecg_fee}
                    onChange={(e) => handleInputChange('ecg_fee', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={savePatientMutation.isPending}>
                  {savePatientMutation.isPending ? 'Saving...' : editingId ? 'Update Patient' : 'Add Patient'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { resetForm(); setShowAddForm(false); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No patients found. Add your first patient to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>OPD Fee</TableHead>
                  <TableHead>Lab Fee</TableHead>
                  <TableHead>Ultrasound</TableHead>
                  <TableHead>ECG</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.patient_name}</TableCell>
                    <TableCell>{patient.contact_number}</TableCell>
                    <TableCell>{patient.doctor_name}</TableCell>
                    <TableCell>Rs. {patient.opd_fee}</TableCell>
                    <TableCell>Rs. {patient.lab_fee}</TableCell>
                    <TableCell>Rs. {patient.ultrasound_fee}</TableCell>
                    <TableCell>Rs. {patient.ecg_fee}</TableCell>
                    <TableCell>
                      Rs. {patient.opd_fee + patient.lab_fee + patient.ultrasound_fee + patient.ecg_fee}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(patient.id);
                            setNewPatient({
                              patient_name: patient.patient_name,
                              contact_number: patient.contact_number,
                              doctor_name: patient.doctor_name,
                              opd_fee: patient.opd_fee || 0,
                              lab_fee: patient.lab_fee || 0,
                              ultrasound_fee: patient.ultrasound_fee || 0,
                              ecg_fee: patient.ecg_fee || 0
                            });
                            setShowAddForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this patient?')) {
                              deletePatient(patient.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Patients;
