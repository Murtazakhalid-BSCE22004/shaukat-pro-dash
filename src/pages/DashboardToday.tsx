import { db } from "@/storage/localDb";
import { computeVisitSplit, isoDateOnly } from "@/utils/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doctor, Visit } from "@/types";
import { useMemo } from "react";

export default function DashboardToday() {
  const today = isoDateOnly(new Date());
  const visits = db.getVisitsByDate(today);
  const doctors = db.getDoctors();

  const { revenueTotal, hospitalTotal, doctorTotal } = useMemo(() => {
    let revenueTotal = 0;
    let hospitalTotal = 0;
    let doctorTotal = 0;

    for (const v of visits) {
      const doc = doctors.find((d) => d.id === v.doctorId);
      if (!doc) continue;
      const split = computeVisitSplit(v as Visit, doc as Doctor);
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
