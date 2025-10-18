import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrainerAnalyticsCards } from './TrainerAnalyticsCards';
import { UtilizationCharts } from './UtilizationCharts';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTrainerUtilization } from '@/hooks/useTrainerUtilization';
import { useBranchContext } from '@/hooks/useBranchContext';
import { mockTrainers, mockTrainerUtilization } from '@/utils/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download,
  Filter,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface TrainerUtilizationDashboardProps {
  className?: string;
}

export const TrainerUtilizationDashboard = ({ className = "" }: TrainerUtilizationDashboardProps) => {
  const { currentBranchId } = useBranchContext();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'individual'>('overview');

  const {
    getBranchUtilizationSummary,
    getOverutilizedTrainers,
    getUnderutilizedTrainers
  } = useTrainerUtilization(currentBranchId || '');

  const branchTrainers = useMemo(() => {
    return mockTrainers.filter(trainer => 
      trainer.branchId === currentBranchId && trainer.isActive
    );
  }, [currentBranchId]);

  const branchSummary = currentBranchId ? getBranchUtilizationSummary(currentBranchId) : null;
  const overutilizedTrainers = getOverutilizedTrainers();
  const underutilizedTrainers = getUnderutilizedTrainers();

  const utilizationData = mockTrainerUtilization.filter(data => 
    data.period === selectedPeriod &&
    (selectedTrainer === 'all' || data.trainerId === selectedTrainer)
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 75) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const exportData = () => {
    // Mock export functionality
    const dataToExport = {
      summary: branchSummary,
      trainers: branchTrainers.map(t => ({
        name: t.fullName,
        utilization: Math.random() * 100,
        revenue: Math.random() * 5000,
        sessions: Math.floor(Math.random() * 50)
      })),
      period: selectedPeriod,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trainer-utilization-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Trainer Utilization Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor trainer performance and optimize resource allocation
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportData} className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as typeof selectedPeriod)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Trainers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainers</SelectItem>
                {branchTrainers.map(trainer => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-1">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overview')}
              >
                Overview
              </Button>
              <Button
                variant={viewMode === 'individual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('individual')}
              >
                Individual
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branch Summary */}
      {branchSummary && (
        <TrainerAnalyticsCards 
          summary={branchSummary}
          period={selectedPeriod}
        />
      )}

      {/* Alerts Section */}
      {(overutilizedTrainers.length > 0 || underutilizedTrainers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Overutilized Trainers Alert */}
          {overutilizedTrainers.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Overutilized Trainers ({overutilizedTrainers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overutilizedTrainers.slice(0, 3).map(metric => {
                  const trainer = branchTrainers.find(t => t.id === metric.trainerId);
                  return trainer ? (
                    <div key={metric.trainerId} className="flex items-center justify-between p-2 bg-white rounded">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={trainer.avatar} alt={trainer.fullName} />
                          <AvatarFallback className="text-xs">{getInitials(trainer.fullName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{trainer.fullName}</span>
                      </div>
                      <Badge variant="destructive">
                        {metric.capacityUsed.toFixed(0)}% utilized
                      </Badge>
                    </div>
                  ) : null;
                })}
              </CardContent>
            </Card>
          )}

          {/* Underutilized Trainers */}
          {underutilizedTrainers.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-700">
                  <TrendingUp className="h-5 w-5" />
                  Underutilized Trainers ({underutilizedTrainers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {underutilizedTrainers.slice(0, 3).map(metric => {
                  const trainer = branchTrainers.find(t => t.id === metric.trainerId);
                  return trainer ? (
                    <div key={metric.trainerId} className="flex items-center justify-between p-2 bg-white rounded">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={trainer.avatar} alt={trainer.fullName} />
                          <AvatarFallback className="text-xs">{getInitials(trainer.fullName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{trainer.fullName}</span>
                      </div>
                      <Badge variant="secondary">
                        {metric.capacityUsed.toFixed(0)}% utilized
                      </Badge>
                    </div>
                  ) : null;
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="charts">Analytics Charts</TabsTrigger>
          <TabsTrigger value="trainers">Trainer Breakdown</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <UtilizationCharts 
            data={utilizationData}
            trainers={branchTrainers}
            period={selectedPeriod}
            selectedTrainer={selectedTrainer}
          />
        </TabsContent>

        <TabsContent value="trainers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branchTrainers.map(trainer => {
              const utilizationMetric = utilizationData.find(d => d.trainerId === trainer.id);
              const utilization = utilizationMetric?.utilizationRate || Math.random() * 100;
              
              return (
                <Card key={trainer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={trainer.avatar} alt={trainer.fullName} />
                        <AvatarFallback>{getInitials(trainer.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{trainer.fullName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {trainer.specialties[0]?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Utilization</span>
                        <span className={`text-sm font-medium ${getUtilizationColor(utilization)}`}>
                          {utilization.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            utilization >= 90 ? 'bg-red-500' :
                            utilization >= 75 ? 'bg-green-500' :
                            utilization >= 50 ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="text-lg font-bold">{trainer.totalSessions}</div>
                          <div className="text-xs text-muted-foreground">Sessions</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="text-lg font-bold">⭐ {trainer.rating}</div>
                          <div className="text-xs text-muted-foreground">Rating</div>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedTrainer(trainer.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Performance Metrics */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">96%</div>
                <div className="text-sm text-muted-foreground">Session Completion Rate</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">4.7</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">$12,450</div>
                <div className="text-sm text-muted-foreground">Monthly Revenue</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">73%</div>
                <div className="text-sm text-muted-foreground">Trial Conversion</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Top Performing Trainers This {selectedPeriod.replace('ly', '')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {branchTrainers.slice(0, 5).map((trainer, index) => (
                  <div key={trainer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={trainer.avatar} alt={trainer.fullName} />
                        <AvatarFallback className="text-xs">{getInitials(trainer.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{trainer.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {trainer.specialties[0]?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">⭐ {trainer.rating}</div>
                      <div className="text-sm text-muted-foreground">{trainer.totalSessions} sessions</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};