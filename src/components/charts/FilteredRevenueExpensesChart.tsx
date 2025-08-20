import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';
import { RevenueExpenseData } from '@/types';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilteredRevenueExpensesChartProps {
  data: RevenueExpenseData[];
  loading?: boolean;
  title?: string;
  description?: string;
  showProfit?: boolean;
  chartType?: 'line' | 'area' | 'bar';
  height?: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const FilteredRevenueExpensesChart: React.FC<FilteredRevenueExpensesChartProps> = ({
  data,
  loading = false,
  title = "Revenue vs Expenses Trend",
  description = "Financial performance over time",
  showProfit = true,
  chartType = 'line',
  height = 350
}) => {
  const [currentChartType, setCurrentChartType] = React.useState(chartType);

  // Calculate trends
  const calculateTrend = (dataKey: string) => {
    if (data.length < 2) return 0;
    const first = data[0][dataKey as keyof RevenueExpenseData] as number;
    const last = data[data.length - 1][dataKey as keyof RevenueExpenseData] as number;
    return ((last - first) / first) * 100;
  };

  const revenueTrend = calculateTrend('revenue');
  const expenseTrend = calculateTrend('expenses');
  const profitTrend = calculateTrend('profit');

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
      children: (
        <>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </>
      )
    };

    switch (currentChartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stackId="2"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.3}
              name="Expenses"
            />
            {showProfit && (
              <Area
                type="monotone"
                dataKey="profit"
                stackId="3"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Net Profit"
              />
            )}
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <Bar
              dataKey="revenue"
              fill="#10b981"
              name="Revenue"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill="#ef4444"
              name="Expenses"
              radius={[4, 4, 0, 0]}
            />
            {showProfit && (
              <Bar
                dataKey="profit"
                fill="#3b82f6"
                name="Net Profit"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              name="Expenses"
            />
            {showProfit && (
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                name="Net Profit"
              />
            )}
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <Card className={`h-${height}`}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className={`h-${height}`}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available for the selected filters
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card className={`h-${height}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {title}
              </CardTitle>
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Select value={currentChartType} onValueChange={(value) => setCurrentChartType(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center space-x-2">
                      <LineChartIcon className="h-4 w-4" />
                      <span>Line</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Area</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Bar</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Trend Indicators */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Revenue:</span>
              <span className={`text-sm flex items-center ${revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueTrend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(revenueTrend).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Expenses:</span>
              <span className={`text-sm flex items-center ${expenseTrend <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {expenseTrend <= 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                {Math.abs(expenseTrend).toFixed(1)}%
              </span>
            </div>
            {showProfit && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Profit:</span>
                <span className={`text-sm flex items-center ${profitTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitTrend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(profitTrend).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={height - 150}>
            {renderChart()}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FilteredRevenueExpensesChart;

