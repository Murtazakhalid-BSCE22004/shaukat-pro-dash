import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-healthcare.jpg";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Hospital Admin | Shaukat International Hospital</title>
        <meta name="description" content="Manage doctors, record visits, and view daily profit summaries for Shaukat International Hospital." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>
      <main>
        <section className="relative overflow-hidden">
          <div className="container mx-auto grid md:grid-cols-2 items-center gap-10 py-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Hospital Revenue & Doctor Share Manager</h1>
              <p className="text-lg text-muted-foreground mb-6">Add doctors with category-wise percentages, record patient visits, and get a clear daily profit summary by doctor and department.</p>
              <div className="flex flex-wrap gap-3">
                <a href="/visits/new"><Button variant="hero" className="">Record Visit</Button></a>
                <a href="/doctors"><Button variant="secondary">Manage Doctors</Button></a>
                <a href="/summary"><Button variant="outline">View Daily Summary</Button></a>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Modern healthcare admin dashboard illustration with teal and blue gradient"
                className="w-full rounded-lg border"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
