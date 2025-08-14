import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface DoctorPerformance {
  name: string;
  revenue: number;
  patients: number;
}

interface TopPerformingDoctorsChartProps {
  data: DoctorPerformance[];
}

const TopPerformingDoctorsChart: React.FC<TopPerformingDoctorsChartProps> = ({ data }) => {
  // Filter out doctors with no data and limit to top 6 for better readability
  const filteredData = data.filter(doctor => doctor.revenue > 0 || doctor.patients > 0).slice(0, 6);
  
  // Calculate max values for percentage scaling
  const maxRevenue = Math.max(...filteredData.map(d => d.revenue));
  const maxPatients = Math.max(...filteredData.map(d => d.patients));
  
  const chartData = {
    labels: filteredData.map(doctor => doctor.name),
    datasets: [
      {
        label: 'Revenue (Rs.)',
        data: filteredData.map(doctor => doctor.revenue),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Patients Count',
        data: filteredData.map(doctor => (doctor.patients / maxPatients) * maxRevenue * 0.7), // Scale patients proportionally
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            return `Dr. ${context[0].label}`;
          },
          label: (context: any) => {
            const doctorIndex = context.dataIndex;
            const doctor = filteredData[doctorIndex];
            const datasetLabel = context.dataset.label;
            
            if (datasetLabel === 'Revenue (Rs.)') {
              return `Revenue: Rs. ${doctor.revenue.toLocaleString()}`;
            } else {
              return `Patients: ${doctor.patients}`;
            }
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
      },
      datalabels: {
        display: true,
        color: '#fff',
        font: {
          weight: 'bold' as const,
          size: 11,
        },
        formatter: (value: number, context: any) => {
          const doctorIndex = context.dataIndex;
          const doctor = filteredData[doctorIndex];
          const datasetLabel = context.dataset.label;
          
          if (datasetLabel === 'Revenue (Rs.)') {
            return doctor.revenue > 0 ? `Rs. ${doctor.revenue.toLocaleString()}` : '';
          } else {
            return doctor.patients > 0 ? `${doctor.patients}` : '';
          }
        },
        anchor: 'center' as const,
        align: 'center' as const,
        offset: 0,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value: any) {
            const numValue = Number(value);
            if (numValue >= 1000) {
              return `${(numValue / 1000).toFixed(0)}K`;
            }
            return numValue.toString();
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: '500',
          },
          color: '#374151',
        },
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    elements: {
      bar: {
        borderWidth: 0,
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[320px]">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TopPerformingDoctorsChart;
