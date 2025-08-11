import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  title: string;
  data: ChartDataPoint[];
  type?: 'bar' | 'line' | 'area';
  height?: number;
  showValues?: boolean;
}

export function SimpleChart({ 
  title, 
  data, 
  type = 'bar', 
  height = 200, 
  showValues = true 
}: SimpleChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((point, index) => {
            const percentage = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
            const barColor = point.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`;
            
            return (
              <div key={point.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{point.label}</span>
                  {showValues && (
                    <span className="text-gray-600">
                      ${point.value.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: barColor
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface TrendChartProps {
  title: string;
  data: ChartDataPoint[];
  height?: number;
}

export function TrendChart({ title, data, height = 200 }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="relative"
          style={{ height: `${height}px` }}
        >
          <svg
            width="100%"
            height="100%"
            className="absolute inset-0"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
              </linearGradient>
            </defs>
            
            {/* Area chart */}
            <path
              d={data.map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = range > 0 ? 100 - ((point.value - minValue) / range) * 100 : 50;
                return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
              }).join(' ')}
              fill="url(#areaGradient)"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = range > 0 ? 100 - ((point.value - minValue) / range) * 100 : 50;
              
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="rgb(59, 130, 246)"
                  className="hover:r-6 transition-all duration-200"
                />
              );
            })}
          </svg>
          
          {/* Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
            {data.map((point, index) => (
              <span key={index} className="transform -rotate-45 origin-left">
                {point.label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
