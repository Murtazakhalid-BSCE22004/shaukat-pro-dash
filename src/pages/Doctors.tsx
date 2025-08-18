import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseDoctorsService, type Doctor } from "@/services/supabaseDoctorsService";

import { toast } from "sonner";
import { ArrowLeft, Plus, Users } from "lucide-react";

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
  const [showForm, setShowForm] = useState(false);



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
    setShowForm(false);
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
    setShowForm(true);
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

      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctors Management</h1>
              <p className="text-gray-600 mt-2">Manage doctor profiles and their details</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group border-0"
              >
                <Plus className="h-4 w-4 mr-2 group-hover:scale-110 group-hover:rotate-90 transition-all duration-200" />
                Add Doctor
              </Button>
            </div>
          </div>
        </div>

        {/* Doctor List Content */}

        {showForm && (
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Plus className="h-4 w-4 text-gray-600" />
                {editingId ? "Edit Doctor" : "Add New Doctor"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-gray-700 border-b border-gray-200 pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Ahmed Khan"
                      required
                      className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                      style={{ 
                        border: '1px solid #d1d5db',
                        outline: 'none',
                        boxShadow: 'none'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.style.borderColor = '#3b82f6';
                        target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.style.borderColor = '#d1d5db';
                        target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      Qualification <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="qualification"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="MBBS, FCPS"
                      required
                      className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                      style={{ 
                        border: '1px solid #d1d5db',
                        outline: 'none',
                        boxShadow: 'none'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.style.borderColor = '#3b82f6';
                        target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.style.borderColor = '#d1d5db';
                        target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Percentage Information Section */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-gray-700 border-b border-gray-200 pb-2">
                  Percentage Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      OPD Percentage
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">%</span>
                      <Input
                        id="opdPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={opdPercentage}
                        onChange={(e) => setOpdPercentage(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 group-hover:border-blue-300"
                        style={{ 
                          border: '1px solid #d1d5db',
                          outline: 'none',
                          boxShadow: 'none'
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#3b82f6';
                          target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#d1d5db';
                          target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      Lab Percentage
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">%</span>
                      <Input
                        id="labPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={labPercentage}
                        onChange={(e) => setLabPercentage(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 group-hover:border-blue-300"
                        style={{ 
                          border: '1px solid #d1d5db',
                          outline: 'none',
                          boxShadow: 'none'
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#3b82f6';
                          target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#d1d5db';
                          target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      Ultrasound Percentage
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">%</span>
                      <Input
                        id="ultrasoundPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={ultrasoundPercentage}
                        onChange={(e) => setUltrasoundPercentage(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 group-hover:border-blue-300"
                        style={{ 
                          border: '1px solid #d1d5db',
                          outline: 'none',
                          boxShadow: 'none'
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#3b82f6';
                          target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#d1d5db';
                          target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      ECG Percentage
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">%</span>
                      <Input
                        id="ecgPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={ecgPercentage}
                        onChange={(e) => setEcgPercentage(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 group-hover:border-blue-300"
                        style={{ 
                          border: '1px solid #d1d5db',
                          outline: 'none',
                          boxShadow: 'none'
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#3b82f6';
                          target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#d1d5db';
                          target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      OT Percentage
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">%</span>
                      <Input
                        id="otPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={otPercentage}
                        onChange={(e) => setOtPercentage(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 group-hover:border-blue-300"
                        style={{ 
                          border: '1px solid #d1d5db',
                          outline: 'none',
                          boxShadow: 'none'
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#3b82f6';
                          target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#d1d5db';
                          target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={saveDoctorMutation.isPending}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group border-0"
                >
                  {saveDoctorMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    editingId ? "Update Doctor" : "Add Doctor"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="px-5 py-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 bg-white text-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        )}

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-800">Doctors List</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Showing</span>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{doctors.length}</span>
                <span className="text-sm text-gray-600">doctors</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-10 text-gray-500">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading doctors...
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-600 mb-1">No doctors found</p>
                <p className="text-sm text-gray-500">Add your first doctor to get started.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-medium text-gray-700 py-3 text-sm">Name</TableHead>
                        <TableHead className="font-medium text-gray-700 py-3 text-sm">Qualification</TableHead>
                        <TableHead className="font-medium text-gray-700 py-3 text-sm">OPD %</TableHead>
                        <TableHead className="font-medium text-gray-700 py-3 text-sm">Lab %</TableHead>
                        <TableHead className="font-medium text-gray-700 py-3 text-sm">Ultrasound %</TableHead>
                        <TableHead className="font-medium text-gray-700 py-3 text-sm">ECG %</TableHead>
                        <TableHead className="font-medium text-gray-700 py-3 text-sm">OT %</TableHead>
                        <TableHead className="font-medium text-gray-700 py-3 text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors.map((doctor: Doctor, index: number) => (
                        <TableRow 
                          key={doctor.id}
                          className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        >
                          <TableCell className="font-medium text-gray-900 py-3">{doctor.name}</TableCell>
                          <TableCell className="text-gray-700 py-3">{doctor.qualification || "N/A"}</TableCell>
                          <TableCell className="text-gray-700 py-3">{doctor.opd_percentage || 0}%</TableCell>
                          <TableCell className="text-gray-700 py-3">{doctor.lab_percentage || 0}%</TableCell>
                          <TableCell className="text-gray-700 py-3">{doctor.ultrasound_percentage || 0}%</TableCell>
                          <TableCell className="text-gray-700 py-3">{doctor.ecg_percentage || 0}%</TableCell>
                          <TableCell className="text-gray-700 py-3">{doctor.ot_percentage || 0}%</TableCell>
                          <TableCell className="py-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(doctor)}
                                className="h-7 px-2.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 bg-white"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeDoctor(doctor.id)}
                                className="h-7 px-2.5 text-xs bg-red-600 hover:bg-red-700 focus:ring-1 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 border-0"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View - Visible only on mobile */}
                <div className="lg:hidden space-y-4">
                  {doctors.map((doctor: Doctor) => (
                    <Card key={doctor.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col space-y-3">
                          {/* Doctor Info */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
                              <p className="text-sm text-gray-600">{doctor.qualification || 'No qualification listed'}</p>
                            </div>
                          </div>

                          {/* Percentage Grid */}
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="text-xs text-blue-600 font-medium">OPD</div>
                              <div className="text-lg font-bold text-blue-700">{doctor.opd_percentage || 0}%</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="text-xs text-green-600 font-medium">Lab</div>
                              <div className="text-lg font-bold text-green-700">{doctor.lab_percentage || 0}%</div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <div className="text-xs text-purple-600 font-medium">Ultrasound</div>
                              <div className="text-lg font-bold text-purple-700">{doctor.ultrasound_percentage || 0}%</div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <div className="text-xs text-orange-600 font-medium">ECG</div>
                              <div className="text-lg font-bold text-orange-700">{doctor.ecg_percentage || 0}%</div>
                            </div>
                          </div>

                          {/* OT Percentage - Full width */}
                          <div className="bg-red-50 p-3 rounded-lg">
                            <div className="text-xs text-red-600 font-medium">Operation Theater (OT)</div>
                            <div className="text-lg font-bold text-red-700">{doctor.ot_percentage || 0}%</div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(doctor)}
                              className="flex-1 h-9 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 bg-white"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeDoctor(doctor.id)}
                              className="flex-1 h-9 text-sm bg-red-600 hover:bg-red-700 focus:ring-1 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 border-0"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DoctorsPage;
