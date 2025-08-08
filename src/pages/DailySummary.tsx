import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/storage/localDb";
import { Doctor, Visit } from "@/types";
import { FEE_CATEGORIES, computeVisitSplit, formatMoney, isoDateOnly } from "@/utils/finance";

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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    setDoctors(db.getDoctors());
  }, []);

  useEffect(() => {
    setVisits(db.getVisitsByDate(date));
  }, [date]);

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

    for (const v of visits) {
      const doc = doctors.find((d) => d.id === v.doctorId);
      if (!doc) continue;
      const s = computeVisitSplit(v, doc);
      const bucket = byDoctor[doc.id];
      for (const c of FEE_CATEGORIES) {
        bucket.totals.doctorByCat[c] += s.doctorByCat[c] || 0;
        bucket.totals.hospitalByCat[c] += s.hospitalByCat[c] || 0;
      }
      bucket.totals.doctorTotal += s.doctorTotal;
      bucket.totals.hospitalTotal += s.hospitalTotal;
      bucket.totals.feeTotal += s.feeTotal;
    }

    return Object.values(byDoctor);
  }, [doctors, visits]);

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
    <main className="container mx-auto py-8">
      <Helmet>
        <title>Daily Summary | Shaukat International Hospital</title>
        <meta name="description" content="Daily profit summary by doctor across OPD, LAB, OT, Ultrasound, ECG and hospital profit overview." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <section className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Daily Summary</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="date" className="text-sm text-muted-foreground">Date</label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </section>

      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Per Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  {FEE_CATEGORIES.map((c) => (
                    <TableHead key={c}>{c} (Dr/Hosp)</TableHead>
                  ))}
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Doctor Earns</TableHead>
                  <TableHead>Hospital Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((s) => (
                  <TableRow key={s.doctor.id}>
                    <TableCell className="font-medium">{s.doctor.name}</TableCell>
                    {FEE_CATEGORIES.map((c) => (
                      <TableCell key={c}>
                        {formatMoney(s.totals.doctorByCat[c] || 0)} / {formatMoney(s.totals.hospitalByCat[c] || 0)}
                      </TableCell>
                    ))}
                    <TableCell>{formatMoney(s.totals.feeTotal)}</TableCell>
                    <TableCell>{formatMoney(s.totals.doctorTotal)}</TableCell>
                    <TableCell>{formatMoney(s.totals.hospitalTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue (All Doctors)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FEE_CATEGORIES.map((c) => (
                <div key={c} className="rounded-md border p-3">
                  <div className="text-sm text-muted-foreground">{c} Dr/Hosp</div>
                  <div className="font-semibold">{formatMoney(grand.doctorByCat[c])} / {formatMoney(grand.hospitalByCat[c])}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              <div className="flex justify-between"><span>Total Fees</span><span className="font-semibold">{formatMoney(grand.feeTotal)}</span></div>
              <div className="flex justify-between"><span>Total Doctor Earnings</span><span className="font-semibold">{formatMoney(grand.doctorTotal)}</span></div>
              <div className="flex justify-between"><span>Total Hospital Profit</span><span className="font-semibold">{formatMoney(grand.hospitalTotal)}</span></div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default DailySummaryPage;
