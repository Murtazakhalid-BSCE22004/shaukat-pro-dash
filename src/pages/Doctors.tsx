import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/storage/localDb";
import { Doctor } from "@/types";
import { FEE_CATEGORIES } from "@/utils/finance";
import { toast } from "sonner";

const emptyPercentages = () => ({ OPD: 0, LAB: 0, OT: 0, ULTRASOUND: 0, ECG: 0 });

const DoctorsPage = () => {
  const [name, setName] = useState("");
  const [percentages, setPercentages] = useState<Record<string, number>>(emptyPercentages());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    setDoctors(db.getDoctors());
  }, []);

  const resetForm = () => {
    setName("");
    setPercentages(emptyPercentages());
    setEditingId(null);
  };

  const onSubmit = () => {
    if (!name.trim()) {
      toast.error("Doctor name is required");
      return;
    }
    const now = new Date().toISOString();
    const doc: Doctor = {
      id: editingId ?? crypto.randomUUID(),
      name: name.trim(),
      percentages: {
        OPD: Number(percentages.OPD) || 0,
        LAB: Number(percentages.LAB) || 0,
        OT: Number(percentages.OT) || 0,
        ULTRASOUND: Number(percentages.ULTRASOUND) || 0,
        ECG: Number(percentages.ECG) || 0,
      },
      createdAt: now,
    };
    db.saveDoctor(doc);
    setDoctors(db.getDoctors());
    toast.success(editingId ? "Doctor updated" : "Doctor added");
    resetForm();
  };

  const startEdit = (doc: Doctor) => {
    setEditingId(doc.id);
    setName(doc.name);
    setPercentages({ ...doc.percentages });
  };

  const remove = (id: string) => {
    db.deleteDoctor(id);
    setDoctors(db.getDoctors());
    if (editingId === id) resetForm();
    toast.success("Doctor removed");
  };

  const title = useMemo(() => (editingId ? "Edit Doctor" : "Add Doctor"), [editingId]);

  return (
    <main className="container mx-auto py-8">
      <Helmet>
        <title>Doctors | Shaukat International Hospital</title>
        <meta name="description" content="Manage doctors and their OPD, LAB, OT, Ultrasound, ECG percentage shares." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Ahmed" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FEE_CATEGORIES.map((cat) => (
                <div key={cat} className="space-y-2">
                  <Label htmlFor={`pct-${cat}`}>{cat} %</Label>
                  <Input
                    id={`pct-${cat}`}
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={percentages[cat] ?? 0}
                    onChange={(e) => setPercentages((p) => ({ ...p, [cat]: parseFloat(e.target.value || "0") }))}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="hero" onClick={onSubmit}>{editingId ? "Update Doctor" : "Add Doctor"}</Button>
              {editingId && (
                <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  {FEE_CATEGORIES.map((c) => (
                    <TableHead key={c}>{c} %</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">No doctors yet.</TableCell>
                  </TableRow>
                ) : (
                  doctors.map((d) => (
                    <TableRow key={d.id} className="align-top">
                      <TableCell className="font-medium">{d.name}</TableCell>
                      {FEE_CATEGORIES.map((c) => (
                        <TableCell key={c}>{d.percentages[c]}%</TableCell>
                      ))}
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => startEdit(d)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => remove(d.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default DoctorsPage;
