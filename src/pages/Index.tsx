import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/storage/localDb";
import { computeVisitSplit, isoDateOnly, formatMoney } from "@/utils/finance";
import DashboardToday from "./DashboardToday";
const Index = () => {
  return (
    <>
      <Helmet>
        <title>Hospital Admin | Shaukat International Hospital</title>
        <meta name="description" content="Manage doctors, record visits, and view daily profit summaries for Shaukat International Hospital." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>
      <main>
        <section className="container mx-auto py-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">Hospital Dashboard</h1>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <a href="/visits/new"><Button variant="hero">Record Visit</Button></a>
            <a href="/doctors"><Button variant="secondary">Manage Doctors</Button></a>
            <a href="/summary"><Button variant="outline">View Daily Summary</Button></a>
          </div>

          {/* Today KPIs */}
          <DashboardToday />
        </section>
      </main>
    </>
  );
};

export default Index;
