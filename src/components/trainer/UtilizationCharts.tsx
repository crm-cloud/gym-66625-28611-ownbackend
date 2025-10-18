import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { TrainerProfile } from '@/types/trainer';
import { TrainerUtilizationMetrics } from '@/utils/trainerUtilization';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface UtilizationChartsProps {
  data: any[];
  trainers: TrainerProfile[];
  period: 'daily' | 'weekly' | 'monthly';
  selectedTrainer: string;
}

export const UtilizationCharts = ({ data, trainers, period, selectedTrainer }: UtilizationChartsProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');

  // Mock data for charts - in real app, this would come from your API
  const generateMockData = () => {
    const labels = period === 'daily' ? 
      Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }).reverse() :
      period === 'weekly' ?
      Array.from({length: 8}, (_, i) => `Week ${i + 1}`) :
      Array.from({length: 12}, (_, i) => new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }));

    return labels.map(label => ({
      period: label,
      utilization: Math.floor(Math.random() * 40) + 60, // 60-100%
      sessions: Math.floor(Math.random() * 20) + 10,
      revenue: Math.floor(Math.random() * 2000) + 1000,
      satisfaction: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0
      newClients: Math.floor(Math.random() * 8) + 2
    }));
  };

  const chartData = generateMockData();

  // Trainer distribution data for pie chart
  const trainerDistribution = trainers.slice(0, 6).map(trainer => ({
    name: trainer.fullName.split(' ')[0], // First name only
    value: Math.floor(Math.random() * 100) + 50,
    sessions: Math.floor(Math.random() * 30) + 10,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'utilization' ? '%' : entry.dataKey === 'revenue' ? '$' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="utilization" fill="#8884d8" name="Utilization %" />
              <Bar dataKey="sessions" fill="#82ca9d" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="utilization" stroke="#8884d8" strokeWidth={2} name="Utilization %" />
              <Line type="monotone" dataKey="satisfaction" stroke="#82ca9d" strokeWidth={2} name="Satisfaction" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#ffc658" fill="#ffc658" name="Revenue" />
              <Area type="monotone" dataKey="sessions" stackId="1" stroke="#ff7300" fill="#ff7300" name="Sessions" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={trainerDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trainerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Trainer Utilization Breakdown</h4>
              {trainerDistribution.map((trainer, index) => (
                <div key={trainer.name} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{trainer.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{trainer.value}%</div>
                    <div className="text-sm text-muted-foreground">{trainer.sessions} sessions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Analytics Visualization</h3>
              <Badge variant="secondary">
                {selectedTrainer === 'all' ? 'All Trainers' : trainers.find(t => t.id === selectedTrainer)?.fullName}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-lg transition-colors ${
                  chartType === 'bar' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-lg transition-colors ${
                  chartType === 'line' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-2 rounded-lg transition-colors ${
                  chartType === 'area' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Activity className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`p-2 rounded-lg transition-colors ${
                  chartType === 'pie' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <PieChartIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {chartType === 'bar' && 'Utilization & Sessions Overview'}
              {chartType === 'line' && 'Utilization & Satisfaction Trends'}
              {chartType === 'area' && 'Revenue & Sessions Distribution'}
              {chartType === 'pie' && 'Trainer Utilization Distribution'}
            </span>
            <Badge variant="outline">{period.charAt(0).toUpperCase() + period.slice(1)} View</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Acquisition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Client Acquisition</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="newClients" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {chartData.reduce((acc, curr) => acc + curr.utilization, 0) / chartData.length}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Utilization</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {chartData.reduce((acc, curr) => acc + curr.sessions, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${chartData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {(chartData.reduce((acc, curr) => acc + parseFloat(curr.satisfaction), 0) / chartData.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Satisfaction</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};