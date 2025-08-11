import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseDoctorsService, type Doctor } from "@/services/supabaseDoctorsService";
import { toast } from "sonner";

const DoctorsPage = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState("");
  const [opdPercentage, setOpdPercentage] = useState(0);
  const [labPercentage, setLabPercentage] = useState(0);
  const [ultrasoundPercentage, setUltrasoundPercentage] = useState(0);
  const [ecgPercentage, setEcgPercentage] = useState(0);
  const [otPercentage, setOtPercentage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch all doctors
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  // Create or update doctor mutation
  const saveDoctorMutation = useMutation({
    mutationFn: async (doctorData: any) => {
      if (editingId) {
        return await supabaseDoctorsService.updateDoctor(editingId, doctorData);
      } else {
        return await supabaseDoctorsService.createDoctor(doctorData);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success(editingId ? "Doctor updated successfully" : "Doctor added successfully");
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Error saving doctor: " + (error?.message || error));
    }
  });

  const resetForm = () => {
    setName("");
    setQualification("");
    setOpdPercentage(0);
    setLabPercentage(0);
    setUltrasoundPercentage(0);
    setEcgPercentage(0);
    setOtPercentage(0);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Doctor name is required");
      return;
    }
    if (!qualification.trim()) {
      toast.error("Qualification is required");
      return;
    }

    const doctorData = {
      name: name.trim(),
      qualification: qualification.trim(),
      specialization: "General", // Default value for existing schema
      consultation_fee: 0, // Default value for existing schema
      experience_years: 0, // Default value for existing schema
      opd_percentage: opdPercentage,
      lab_percentage: labPercentage,
      ultrasound_percentage: ultrasoundPercentage,
      ecg_percentage: ecgPercentage,
      ot_percentage: otPercentage,
      is_active: true,
    };
    
    saveDoctorMutation.mutate(doctorData);
  };

  const startEdit = (doctor: Doctor) => {
    setEditingId(doctor.id);
    setName(doctor.name);
    setQualification(doctor.qualification || "");
    setOpdPercentage(doctor.opd_percentage || 0);
    setLabPercentage(doctor.lab_percentage || 0);
    setUltrasoundPercentage(doctor.ultrasound_percentage || 0);
    setEcgPercentage(doctor.ecg_percentage || 0);
    setOtPercentage(doctor.ot_percentage || 0);
  };

  const removeDoctor = async (id: string) => {
    try {
      await supabaseDoctorsService.deleteDoctor(id);
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success("Doctor removed successfully");
      if (editingId === id) resetForm();
    } catch (error) {
      toast.error("Error removing doctor");
    }
  };

  return (
    <>
      <Helmet>
        <title>Doctors | Shaukat International Hospital</title>
        <meta name="description" content="Manage doctors and their details for the hospital system." />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Doctors Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Doctor" : "Add New Doctor"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Ahmed Khan"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="qualification">Qualification *</Label>
                  <Input
                    id="qualification"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="MBBS, FCPS"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="opdPercentage">OPD Percentage</Label>
                  <Input
                    id="opdPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={opdPercentage}
                    onChange={(e) => setOpdPercentage(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="labPercentage">Lab Percentage</Label>
                  <Input
                    id="labPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={labPercentage}
                    onChange={(e) => setLabPercentage(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="ultrasoundPercentage">Ultrasound Percentage</Label>
                  <Input
                    id="ultrasoundPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={ultrasoundPercentage}
                    onChange={(e) => setUltrasoundPercentage(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="ecgPercentage">ECG Percentage</Label>
                  <Input
                    id="ecgPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={ecgPercentage}
                    onChange={(e) => setEcgPercentage(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="otPercentage">OT Percentage</Label>
                  <Input
                    id="otPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={otPercentage}
                    onChange={(e) => setOtPercentage(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={saveDoctorMutation.isPending}
                >
                  {saveDoctorMutation.isPending ? "Saving..." : editingId ? "Update Doctor" : "Add Doctor"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doctors List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No doctors found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>OPD %</TableHead>
                    <TableHead>Lab %</TableHead>
                    <TableHead>Ultrasound %</TableHead>
                    <TableHead>ECG %</TableHead>
                    <TableHead>OT %</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor: Doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.qualification || "N/A"}</TableCell>
                      <TableCell>{doctor.opd_percentage || 0}%</TableCell>
                      <TableCell>{doctor.lab_percentage || 0}%</TableCell>
                      <TableCell>{doctor.ultrasound_percentage || 0}%</TableCell>
                      <TableCell>{doctor.ecg_percentage || 0}%</TableCell>
                      <TableCell>{doctor.ot_percentage || 0}%</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(doctor)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeDoctor(doctor.id)}
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
    </>
  );
};

export default DoctorsPage;
