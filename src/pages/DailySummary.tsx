import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabaseDoctorsService, type Doctor } from "@/services/supabaseDoctorsService";
import { supabasePatientsService, type Patient } from "@/services/supabasePatientsService";
import { FEE_CATEGORIES, computeVisitSplit, formatMoney, isoDateOnly } from "@/utils/finance";
import { ArrowLeft } from "lucide-react";

interface DoctorSummary {
  doctor: Doctor;
  totals: {
    doctorByCat: Record<string, number>;
    hospitalByCat: Record<string, number>;
    doctorTotal: number;
    hospitalTotal: number;
    feeTotal: number;
  };
}

const DailySummaryPage = () => {
  const [date, setDate] = useState(isoDateOnly(new Date()));

  // Fetch doctors and patients for the selected date
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', 'date', date],
    queryFn: async () => {
      // Get patients created on the selected date
      // Use local timezone to avoid UTC conversion issues
      const startISO = `${date}T00:00:00.000+05:00`;
      const endISO = `${date}T23:59:59.999+05:00`;
      return await supabasePatientsService.getPatientsByDateRange(startISO, endISO);
    },
  });

  const summaries = useMemo<DoctorSummary[]>(() => {
    const byDoctor: Record<string, DoctorSummary> = {};
    for (const doc of doctors) {
      byDoctor[doc.id] = {
        doctor: doc,
        totals: {
          doctorByCat: { OPD: 0, LAB: 0, OT: 0, ULTRASOUND: 0, ECG: 0 },
          hospitalByCat: { OPD: 0, LAB: 0, OT: 0, ULTRASOUND: 0, ECG: 0 },
          doctorTotal: 0,
          hospitalTotal: 0,
          feeTotal: 0,
        },
      };
    }

    for (const patient of patients) {
      // Find doctor by name (since patients table uses doctor_name string)
      const doctor = doctors.find((d) => d.name === patient.doctor_name);
      if (!doctor) {
        continue;
      }
      
      // Convert patient to the format expected by computeVisitSplit
      const patientData = {
        id: patient.id,
        patientName: patient.patient_name,
        contact: patient.contact_number,
        doctorId: doctor.id, // Use the found doctor's ID
        date: patient.created_at, // Use created_at as the date
        fees: {
          OPD: patient.opd_fee || 0,
          LAB: patient.lab_fee || 0,
          OT: patient.ot_fee || 0, // Now using the ot_fee field
          ULTRASOUND: patient.ultrasound_fee || 0,
          ECG: patient.ecg_fee || 0,
        },
      };

      const doctorData = {
        id: doctor.id,
        name: doctor.name,
        percentages: {
          OPD: doctor.opd_percentage ?? 0,
          LAB: doctor.lab_percentage ?? 0,
          OT: doctor.ot_percentage ?? 0,
          ULTRASOUND: doctor.ultrasound_percentage ?? 0,
          ECG: doctor.ecg_percentage ?? 0,
        },
        createdAt: doctor.created_at,
      };

      const s = computeVisitSplit(patientData, doctorData);
      
      const bucket = byDoctor[doctor.id];
      for (const c of FEE_CATEGORIES) {
        bucket.totals.doctorByCat[c] += s.doctorByCat[c] || 0;
        bucket.totals.hospitalByCat[c] += s.hospitalByCat[c] || 0;
      }
      bucket.totals.doctorTotal += s.doctorTotal;
      bucket.totals.hospitalTotal += s.hospitalTotal;
      bucket.totals.feeTotal += s.feeTotal;
    }

    return Object.values(byDoctor);
  }, [doctors, patients]);

  const grand = useMemo(() => {
    return summaries.reduce(
      (acc, s) => {
        for (const c of FEE_CATEGORIES) {
          acc.doctorByCat[c] += s.totals.doctorByCat[c] || 0;
          acc.hospitalByCat[c] += s.totals.hospitalByCat[c] || 0;
        }
        acc.doctorTotal += s.totals.doctorTotal;
        acc.hospitalTotal += s.totals.hospitalTotal;
        acc.feeTotal += s.totals.feeTotal;
        return acc;
      },
      {
        doctorByCat: { OPD: 0, LAB: 0, OT: 0, ULTRASOUND: 0, ECG: 0 },
        hospitalByCat: { OPD: 0, LAB: 0, OT: 0, ULTRASOUND: 0, ECG: 0 },
        doctorTotal: 0,
        hospitalTotal: 0,
        feeTotal: 0,
      }
    );
  }, [summaries]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Daily Summary | Shaukat International Hospital</title>
        <meta name="description" content="Daily profit summary by doctor across OPD, LAB, OT, Ultrasound, ECG and hospital profit overview." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <div className="container mx-auto px-4">
        {/* Header Section */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <Link to="/professional">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </Button>
              </Link>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Summary</h1>
                <p className="text-gray-600">Revenue breakdown and profit analysis by doctor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="date" className="text-sm font-medium text-gray-700">Select Date</label>
              <Input 
                id="date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-900">{formatMoney(grand.feeTotal)}</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Doctor Earnings</p>
                    <p className="text-2xl font-bold text-green-900">{formatMoney(grand.doctorTotal)}</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Hospital Profit</p>
                    <p className="text-2xl font-bold text-purple-900">{formatMoney(grand.hospitalTotal)}</p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Per Doctor Table */}
        <section className="mb-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl font-semibold text-gray-800">Revenue by Doctor</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Detailed breakdown of earnings and hospital profit per doctor</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                      {FEE_CATEGORIES.map((c) => (
                        <TableHead key={c} className="font-semibold text-gray-700 text-center">{c}</TableHead>
                      ))}
                      <TableHead className="font-semibold text-gray-700 text-center">Total Fees</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Doctor Earns</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Hospital Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaries.map((s) => (
                      <TableRow key={s.doctor.id} className="hover:bg-gray-50">
                                                 <TableCell className="font-medium text-gray-900">
                           <div>
                             <p className="font-semibold">{s.doctor.name}</p>
                             <p className="text-sm text-gray-400">Hospital</p>
                           </div>
                         </TableCell>
                        {FEE_CATEGORIES.map((c) => (
                          <TableCell key={c} className="text-center">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-green-600">{formatMoney(s.totals.doctorByCat[c] || 0)}</p>
                              <p className="text-xs text-gray-500">{formatMoney(s.totals.hospitalByCat[c] || 0)}</p>
                            </div>
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <span className="font-semibold text-gray-900">{formatMoney(s.totals.feeTotal)}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-green-600">{formatMoney(s.totals.doctorTotal)}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-purple-600">{formatMoney(s.totals.hospitalTotal)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Daily Revenue Summary */}
        <section>
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b">
              <CardTitle className="text-xl font-semibold text-indigo-800">Daily Revenue Summary</CardTitle>
              <p className="text-sm text-indigo-600 mt-1">Consolidated revenue across all fee categories</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {FEE_CATEGORIES.map((c) => (
                  <div key={c} className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <p className="text-sm font-medium text-gray-600 mb-2">{c}</p>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-green-600">{formatMoney(grand.doctorByCat[c])}</p>
                      <p className="text-sm text-gray-500">{formatMoney(grand.hospitalByCat[c])}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">{formatMoney(grand.feeTotal)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Doctor Earnings</p>
                  <p className="text-2xl font-bold text-green-600">{formatMoney(grand.doctorTotal)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Hospital Profit</p>
                  <p className="text-2xl font-bold text-purple-600">{formatMoney(grand.hospitalTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default DailySummaryPage;
