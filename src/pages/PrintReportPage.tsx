import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabaseDoctorsService, type Doctor } from '@/services/supabaseDoctorsService';
import { supabasePatientsService, type Patient } from '@/services/supabasePatientsService';
import { FEE_CATEGORIES, computeVisitSplit, formatMoney, isoDateOnly } from '@/utils/finance';
import PrintReport from '@/components/ui/PrintReport';
import '../styles/print-report.css';

type ReportType = 'doctor_performance' | 'patient_volume' | 'revenue_analysis' | 'payment_status' | 'hospital_profit';

interface ReportData {
  title: string;
  description: string;
  data: any[];
  columns: string[];
}

const PrintReportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [reportData, setReportData] = useState<ReportData>({
    title: '',
    description: '',
    data: [],
    columns: []
  });

  // Get parameters from URL
  const reportType = searchParams.get('type') as ReportType || 'doctor_performance';
  const startDate = searchParams.get('startDate') || isoDateOnly(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const endDate = searchParams.get('endDate') || isoDateOnly(new Date());
  const timeRange = searchParams.get('timeRange') || 'monthly';

  // Fetch data
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', 'date-range', startDate, endDate],
    queryFn: async () => {
      const startISO = `${startDate}T00:00:00.000+05:00`;
      const endISO = `${endDate}T23:59:59.999+05:00`;
      return await supabasePatientsService.getPatientsByDateRange(startISO, endISO);
    },
  });

  // Generate report data
  useEffect(() => {
    const generateReport = () => {
      switch (reportType) {
        case 'doctor_performance':
          setReportData(generateDoctorPerformanceReport(doctors, patients));
          break;
        case 'patient_volume':
          setReportData(generatePatientVolumeReport(patients));
          break;
        case 'revenue_analysis':
          setReportData(generateRevenueAnalysisReport(doctors, patients));
          break;
        case 'payment_status':
          setReportData(generatePaymentStatusReport(patients));
          break;
        case 'hospital_profit':
          setReportData(generateHospitalProfitReport(doctors, patients));
          break;
        default:
          setReportData(generateDoctorPerformanceReport(doctors, patients));
      }
    };

    if (doctors.length > 0 || patients.length > 0) {
      generateReport();
    }
  }, [reportType, doctors, patients]);

  // Auto-print when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Report generation functions
  function generateDoctorPerformanceReport(doctors: Doctor[], patients: Patient[]): ReportData {
    const doctorStats = doctors.map(doctor => {
      const doctorPatients = patients.filter(p => p.doctor_name === doctor.name);
      
      let totalRevenue = 0;
      let hospitalProfit = 0;
      let doctorProfit = 0;
      
      doctorPatients.forEach(patient => {
        const visitData = {
          id: patient.id,
          patientName: patient.patient_name,
          contact: patient.contact_number,
          doctorId: doctor.id,
          date: patient.created_at,
          fees: {
            OPD: patient.opd_fee || 0,
            LAB: patient.lab_fee || 0,
            OT: patient.ot_fee || 0,
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

        const split = computeVisitSplit(visitData, doctorData);
        totalRevenue += split.feeTotal;
        hospitalProfit += split.hospitalTotal;
        doctorProfit += split.doctorTotal;
      });
      
      return {
        'Doctor Name': doctor.name,
        'Specialization': doctor.specialization || 'N/A',
        'Patient Count': doctorPatients.length,
        'Total Revenue': totalRevenue,
        'Hospital Profit': hospitalProfit,
        'Doctor Profit': doctorProfit,
        'Hospital %': totalRevenue > 0 ? `${((hospitalProfit / totalRevenue) * 100).toFixed(1)}%` : '0%',
      };
    });

    return {
      title: 'Doctor Performance Report',
      description: 'Comprehensive analysis of doctor performance including patient count, revenue, and hospital vs doctor profit splits',
      data: doctorStats,
      columns: ['Doctor Name', 'Specialization', 'Patient Count', 'Total Revenue', 'Hospital Profit', 'Doctor Profit', 'Hospital %']
    };
  }

  function generatePatientVolumeReport(patients: Patient[]): ReportData {
    const dailyStats = patients.reduce((acc, patient) => {
      const date = new Date(patient.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, count: 0, totalRevenue: 0, hospitalProfit: 0, doctorProfit: 0 };
      }
      
      const totalPatientRevenue = (patient.opd_fee || 0) + (patient.lab_fee || 0) + (patient.ot_fee || 0) + (patient.ultrasound_fee || 0) + (patient.ecg_fee || 0);
      
      acc[date].count++;
      acc[date].totalRevenue += totalPatientRevenue;
      acc[date].hospitalProfit += totalPatientRevenue;
      acc[date].doctorProfit += 0;
      
      return acc;
    }, {} as Record<string, { date: string; count: number; totalRevenue: number; hospitalProfit: number; doctorProfit: number }>);

    const data = Object.values(dailyStats).map(stat => ({
      'Date': stat.date,
      'Patient Count': stat.count,
      'Total Revenue': stat.totalRevenue,
      'Hospital Profit': stat.hospitalProfit,
      'Average Revenue per Patient': stat.count > 0 ? stat.totalRevenue / stat.count : 0,
    }));

    return {
      title: 'Patient Volume Report',
      description: 'Daily patient volume trends and revenue analysis',
      data: data,
      columns: ['Date', 'Patient Count', 'Total Revenue', 'Hospital Profit', 'Average Revenue per Patient']
    };
  }

  function generateRevenueAnalysisReport(doctors: Doctor[], patients: Patient[]): ReportData {
    const revenueByCategory = FEE_CATEGORIES.reduce((acc, category) => {
      const categoryKey = category.toLowerCase().replace(' ', '_') + '_fee';
      let total = 0;
      let hospitalProfit = 0;
      let doctorProfit = 0;
      
      patients.forEach(patient => {
        const fee = patient[categoryKey as keyof Patient] as number || 0;
        total += fee;
        
        const doctor = doctors.find(d => d.name === patient.doctor_name);
        if (doctor) {
          const percentageKey = category.toLowerCase().replace(' ', '_') + '_percentage';
          const doctorPercentage = doctor[percentageKey as keyof Doctor] as number || 0;
          const doctorAmount = fee * (doctorPercentage / 100);
          const hospitalAmount = fee - doctorAmount;
          
          hospitalProfit += hospitalAmount;
          doctorProfit += doctorAmount;
        } else {
          hospitalProfit += fee;
        }
      });
      
      acc[category] = { total, hospital: hospitalProfit, doctor: doctorProfit };
      return acc;
    }, {} as Record<string, { total: number; hospital: number; doctor: number }>);

    const data = Object.entries(revenueByCategory).map(([category, amounts]) => ({
      'Fee Category': category,
      'Total Revenue': amounts.total,
      'Hospital Profit': amounts.hospital,
      'Doctor Profit': amounts.doctor,
      'Hospital %': amounts.total > 0 ? `${((amounts.hospital / amounts.total) * 100).toFixed(1)}%` : '0%',
      'Patient Count': patients.filter(p => (p[category.toLowerCase().replace(' ', '_') + '_fee' as keyof Patient] as number || 0) > 0).length,
    }));

    return {
      title: 'Daily Revenue Report',
      description: 'Daily revenue breakdown by fee categories with hospital vs doctor profit splits',
      data: data,
      columns: ['Fee Category', 'Total Revenue', 'Hospital Profit', 'Doctor Profit', 'Hospital %', 'Patient Count']
    };
  }

  function generatePaymentStatusReport(patients: Patient[]): ReportData {
    const paymentStatus = patients.map(patient => {
      const totalFees = (patient.opd_fee || 0) + (patient.lab_fee || 0) + (patient.ot_fee || 0) + (patient.ultrasound_fee || 0) + (patient.ecg_fee || 0);
      return {
        'Patient Name': patient.patient_name,
        'Contact': patient.contact_number,
        'Doctor': patient.doctor_name,
        'Total Fees': totalFees,
        'Date': new Date(patient.created_at).toLocaleDateString(),
        'Status': totalFees > 0 ? 'Pending' : 'No Fees',
      };
    });

    return {
      title: 'Payment Status Report',
      description: 'Overview of patient payment status and outstanding amounts',
      data: paymentStatus,
      columns: ['Patient Name', 'Contact', 'Doctor', 'Total Fees', 'Date', 'Status']
    };
  }

  function generateHospitalProfitReport(doctors: Doctor[], patients: Patient[]): ReportData {
    let totalHospitalProfit = 0;
    let totalDoctorProfit = 0;
    let totalRevenue = 0;
    let patientCount = 0;
    
    const revenueByDoctor: Record<string, { 
      doctorName: string; 
      patientCount: number; 
      totalRevenue: number; 
      hospitalProfit: number; 
      doctorProfit: number; 
      hospitalPercentage: number;
    }> = {};

    doctors.forEach(doctor => {
      revenueByDoctor[doctor.id] = {
        doctorName: doctor.name,
        patientCount: 0,
        totalRevenue: 0,
        hospitalProfit: 0,
        doctorProfit: 0,
        hospitalPercentage: 0,
      };
    });

    patients.forEach(patient => {
      const totalPatientRevenue = (patient.opd_fee || 0) + (patient.lab_fee || 0) + (patient.ot_fee || 0) + (patient.ultrasound_fee || 0) + (patient.ecg_fee || 0);
      
      const doctor = doctors.find(d => d.name === patient.doctor_name);
      
      if (doctor) {
        const visitData = {
          id: patient.id,
          patientName: patient.patient_name,
          contact: patient.contact_number,
          doctorId: doctor.id,
          date: patient.created_at,
          fees: {
            OPD: patient.opd_fee || 0,
            LAB: patient.lab_fee || 0,
            OT: patient.ot_fee || 0,
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

        const split = computeVisitSplit(visitData, doctorData);
        
        totalRevenue += split.feeTotal;
        totalHospitalProfit += split.hospitalTotal;
        totalDoctorProfit += split.doctorTotal;
        patientCount++;
        
        const doctorRevenue = revenueByDoctor[doctor.id];
        if (doctorRevenue) {
          doctorRevenue.patientCount++;
          doctorRevenue.totalRevenue += split.feeTotal;
          doctorRevenue.hospitalProfit += split.hospitalTotal;
          doctorRevenue.doctorProfit += split.doctorTotal;
          doctorRevenue.hospitalPercentage = split.feeTotal > 0 ? (split.hospitalTotal / split.feeTotal) * 100 : 0;
        }
      } else {
        totalRevenue += totalPatientRevenue;
        totalHospitalProfit += totalPatientRevenue;
        patientCount++;
      }
    });

    const data = Object.values(revenueByDoctor)
      .filter(doc => doc.patientCount > 0)
      .map(doc => ({
        'Doctor Name': doc.doctorName,
        'Patient Count': doc.patientCount,
        'Total Revenue': doc.totalRevenue,
        'Hospital Profit': doc.hospitalProfit,
        'Doctor Profit': doc.doctorProfit,
        'Hospital %': `${doc.hospitalPercentage.toFixed(1)}%`,
      }));

    data.unshift({
      'Doctor Name': 'TOTAL',
      'Patient Count': patientCount,
      'Total Revenue': totalRevenue,
      'Hospital Profit': totalHospitalProfit,
      'Doctor Profit': totalDoctorProfit,
      'Hospital %': totalRevenue > 0 ? `${((totalHospitalProfit / totalRevenue) * 100).toFixed(1)}%` : '0%',
    });

    return {
      title: 'Hospital Profit Report',
      description: 'Comprehensive breakdown of hospital profit vs doctor payouts with detailed doctor-wise analysis',
      data: data,
      columns: ['Doctor Name', 'Patient Count', 'Total Revenue', 'Hospital Profit', 'Doctor Profit', 'Hospital %']
    };
  }

  return (
    <div className="print-only-page">
      <PrintReport
        title={reportData.title}
        description={reportData.description}
        reportData={reportData.data}
        columns={reportData.columns}
        startDate={startDate}
        endDate={endDate}
        timeRange={timeRange}
        reportType={reportType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      />
    </div>
  );
};

export default PrintReportPage;
