import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { computeVisitSplit, isoDateOnly } from "@/utils/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseDoctorsService } from "@/services/supabaseDoctorsService";
import { supabaseVisitsService } from "@/services/supabaseVisitsService";

export default function DashboardToday() {
  const today = isoDateOnly(new Date());

  // Fetch doctors and visits for today
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits', 'today', today],
    queryFn: () => supabaseVisitsService.getVisitsByDate(today),
  });

  // Calculate totals
  const { revenueTotal, hospitalTotal, doctorTotal } = useMemo(() => {
    let revenueTotal = 0;
    let hospitalTotal = 0;
    let doctorTotal = 0;

    for (const visit of visits) {
      const doctor = doctors.find((d) => d.id === visit.doctor_id);
      if (!doctor) continue;
      
      // Convert visit to the format expected by computeVisitSplit
      const visitData = {
        id: visit.id,
        patientName: visit.patient_name,
        contact: visit.contact,
        doctorId: visit.doctor_id,
        date: visit.visit_date,
        fees: {
          OPD: visit.opd_fee || 0,
          LAB: visit.lab_fee || 0,
          OT: visit.ot_fee || 0,
          ULTRASOUND: visit.ultrasound_fee || 0,
          ECG: visit.ecg_fee || 0,
        },
      };

      const doctorData = {
        id: doctor.id,
        name: doctor.name,
        percentages: {
          OPD: 70, // Default percentages - you might want to store these in the database
          LAB: 70,
          OT: 70,
          ULTRASOUND: 70,
          ECG: 70,
        },
        createdAt: doctor.created_at,
      };

      const split = computeVisitSplit(visitData, doctorData);
      revenueTotal += split.feeTotal;
      hospitalTotal += split.hospitalTotal;
      doctorTotal += split.doctorTotal;
    }

    return { revenueTotal, hospitalTotal, doctorTotal };
  }, [visits, doctors]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Visits Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{visits.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hospital Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(hospitalTotal)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(doctorTotal)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
