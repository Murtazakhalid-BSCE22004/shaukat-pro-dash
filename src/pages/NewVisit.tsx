import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseDoctorsService, type Doctor } from "@/services/supabaseDoctorsService";
import { supabaseVisitsService } from "@/services/supabaseVisitsService";
import { FEE_CATEGORIES, computeVisitSplit, formatMoney, isoDateOnly } from "@/utils/finance";
import { toast } from "sonner";

const NewVisitPage = () => {
  const queryClient = useQueryClient();
  const [doctorId, setDoctorId] = useState<string>("");
  const [patientName, setPatientName] = useState("");
  const [contact, setContact] = useState("");
  const [date, setDate] = useState(isoDateOnly(new Date()));
  const [fees, setFees] = useState<Record<string, number>>({});

  // Fetch doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  // Create visit mutation
  const createVisitMutation = useMutation({
    mutationFn: supabaseVisitsService.createVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success("Visit recorded successfully");
      // reset
      setPatientName("");
      setContact("");
      setFees({});
    },
    onError: (error) => {
      toast.error("Error recording visit: " + error);
    }
  });

  const selectedDoctor = useMemo(() => doctors.find((d) => d.id === doctorId), [doctors, doctorId]);
  const preview = useMemo(() => {
    if (!selectedDoctor) return null;
    const visitData = {
      id: "preview",
      patientName,
      contact,
      doctorId,
      date,
      fees: FEE_CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: Number(fees[c] || 0) }), {} as Record<string, number>),
    };
    const doctorData = {
      id: selectedDoctor.id,
      name: selectedDoctor.name,
      percentages: {
        OPD: 70, // Default percentages - you might want to store these in the database
        LAB: 70,
        OT: 70,
        ULTRASOUND: 70,
        ECG: 70,
      },
      createdAt: selectedDoctor.created_at,
    };
    return computeVisitSplit(visitData, doctorData);
  }, [selectedDoctor, patientName, contact, doctorId, date, fees]);

  const onSubmit = () => {
    if (!selectedDoctor) return toast.error("Please add/select a doctor first");
    if (!patientName.trim()) return toast.error("Patient name is required");

    const visitData = {
      patient_name: patientName.trim(),
      contact: contact.trim(),
      doctor_id: selectedDoctor.id,
      visit_date: date,
      opd_fee: Number(fees['OPD'] || 0),
      lab_fee: Number(fees['LAB'] || 0),
      ot_fee: Number(fees['OT'] || 0),
      ultrasound_fee: Number(fees['ULTRASOUND'] || 0),
      ecg_fee: Number(fees['ECG'] || 0),
    };

    createVisitMutation.mutate(visitData);
  };

  return (
    <main className="container mx-auto py-8">
      <Helmet>
        <title>New Visit | Shaukat International Hospital</title>
        <meta name="description" content="Record patient visit fees and automatically split earnings between doctor and hospital." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>
      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Record Visit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select value={doctorId} onValueChange={setDoctorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient Name</Label>
                <Input id="patient" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="0300-1234567" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FEE_CATEGORIES.map((cat) => (
                <div key={cat} className="space-y-2">
                  <Label htmlFor={`fee-${cat}`}>{cat} Fee</Label>
                  <Input
                    id={`fee-${cat}`}
                    type="number"
                    min={0}
                    step={0.01}
                    value={fees[cat] ?? ""}
                    onChange={(e) => setFees((p) => ({ ...p, [cat]: parseFloat(e.target.value || "0") }))}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <Button variant="hero" onClick={onSubmit}>Save Visit</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Split Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedDoctor ? (
              <p className="text-muted-foreground">Add a doctor to preview earnings split.</p>
            ) : !preview ? null : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Percentages for {selectedDoctor.name} apply per category.</p>
                <div className="grid grid-cols-2 gap-2">
                  {FEE_CATEGORIES.map((c) => (
                    <div key={c} className="flex items-center justify-between rounded-md border p-2">
                      <span className="text-sm">{c}</span>
                      <span className="text-sm font-medium">
                        Dr: {formatMoney(preview.doctorByCat[c] || 0)} · Hosp: {formatMoney(preview.hospitalByCat[c] || 0)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-1">
                  <div className="flex justify-between"><span>Total Fees</span><span className="font-semibold">{formatMoney(preview.feeTotal)}</span></div>
                  <div className="flex justify-between"><span>Doctor Earns</span><span className="font-semibold">{formatMoney(preview.doctorTotal)}</span></div>
                  <div className="flex justify-between"><span>Hospital Profit</span><span className="font-semibold">{formatMoney(preview.hospitalTotal)}</span></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default NewVisitPage;
