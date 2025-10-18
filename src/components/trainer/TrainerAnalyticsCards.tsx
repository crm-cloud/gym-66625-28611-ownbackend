import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';

interface BranchUtilizationSummary {
  averageUtilization: number;
  totalTrainers: number;
  activeTrainers: number;
  overutilizedCount: number;
  underutilizedCount: number;
}

interface TrainerAnalyticsCardsProps {
  summary: BranchUtilizationSummary;
  period: 'daily' | 'weekly' | 'monthly';
}

export const TrainerAnalyticsCards = ({ summary, period }: TrainerAnalyticsCardsProps) => {
  // Mock additional metrics based on period
  const periodMetrics = {
    sessions: period === 'daily' ? 145 : period === 'weekly' ? 987 : 4250,
    revenue: period === 'daily' ? 8750 : period === 'weekly' ? 58500 : 247500,
    newClients: period === 'daily' ? 12 : period === 'weekly' ? 78 : 320,
    avgSessionDuration: 62, // minutes
    clientSatisfaction: 4.7,
    conversionRate: 73
  };

  const getUtilizationStatus = (rate: number) => {
    if (rate >= 85) return { color: 'text-green-600', bg: 'bg-green-50', status: 'Excellent' };
    if (rate >= 70) return { color: 'text-blue-600', bg: 'bg-blue-50', status: 'Good' };
    if (rate >= 50) return { color: 'text-yellow-600', bg: 'bg-yellow-50', status: 'Fair' };
    return { color: 'text-red-600', bg: 'bg-red-50', status: 'Needs Attention' };
  };

  const utilizationStatus = getUtilizationStatus(summary.averageUtilization);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const cards = [
    {
      title: 'Average Utilization',
      value: `${summary.averageUtilization.toFixed(1)}%`,
      icon: Target,
      trend: '+2.5%',
      trendDirection: 'up' as const,
      description: `${utilizationStatus.status} utilization rate`,
      color: utilizationStatus.color,
      bg: utilizationStatus.bg
    },
    {
      title: 'Active Trainers',
      value: `${summary.activeTrainers}`,
      subValue: `of ${summary.totalTrainers} total`,
      icon: Users,
      trend: '+3',
      trendDirection: 'up' as const,
      description: `${((summary.activeTrainers / summary.totalTrainers) * 100).toFixed(0)}% active`,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: `${period.charAt(0).toUpperCase() + period.slice(1, -2)} Sessions`,
      value: periodMetrics.sessions.toLocaleString(),
      icon: Calendar,
      trend: '+12.5%',
      trendDirection: 'up' as const,
      description: `${(periodMetrics.sessions / summary.activeTrainers).toFixed(0)} per trainer`,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: `${period.charAt(0).toUpperCase() + period.slice(1, -2)} Revenue`,
      value: formatCurrency(periodMetrics.revenue),
      icon: DollarSign,
      trend: '+8.3%',
      trendDirection: 'up' as const,
      description: `${formatCurrency(periodMetrics.revenue / summary.activeTrainers)} per trainer`,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Avg Session Duration',
      value: `${periodMetrics.avgSessionDuration}m`,
      icon: Clock,
      trend: '+5m',
      trendDirection: 'up' as const,
      description: 'Above target duration',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      title: 'Client Satisfaction',
      value: `${periodMetrics.clientSatisfaction}/5`,
      icon: TrendingUp,
      trend: '+0.2',
      trendDirection: 'up' as const,
      description: `${(periodMetrics.clientSatisfaction / 5 * 100).toFixed(0)}% satisfaction rate`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ];

  // Alert cards for utilization issues
  const alertCards = [];
  
  if (summary.overutilizedCount > 0) {
    alertCards.push({
      title: 'Overutilized Trainers',
      value: summary.overutilizedCount.toString(),
      icon: AlertTriangle,
      description: 'Trainers above 90% capacity',
      color: 'text-red-600',
      bg: 'bg-red-50',
      alert: true
    });
  }

  if (summary.underutilizedCount > 0) {
    alertCards.push({
      title: 'Underutilized Trainers',
      value: summary.underutilizedCount.toString(),
      icon: TrendingDown,
      description: 'Trainers below 60% capacity',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      alert: true
    });
  }

  const allCards = [...cards, ...alertCards];

  return (
    <div className="space-y-4">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className={`hover:shadow-md transition-shadow ${card.bg}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">{card.value}</p>
                      {card.subValue && (
                        <p className="text-sm text-muted-foreground">{card.subValue}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge 
                    variant={card.trendDirection === 'up' ? 'default' : 'secondary'}
                    className={`mb-1 ${
                      card.trendDirection === 'up' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                        : 'bg-red-100 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    {card.trendDirection === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {card.trend}
                  </Badge>
                </div>
              </div>
              
              {card.description && (
                <p className="text-xs text-muted-foreground mt-2">{card.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Cards */}
      {alertCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertCards.map((card, index) => (
            <Card key={`alert-${index}`} className={`border-2 ${
              card.color.includes('red') ? 'border-red-200' : 'border-yellow-200'
            } ${card.bg}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{card.title}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">New Clients</p>
                <p className="text-lg font-bold text-blue-600">+{periodMetrics.newClients}</p>
                <p className="text-xs text-muted-foreground">This {period.slice(0, -2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Conversion Rate</p>
                <p className="text-lg font-bold text-purple-600">{periodMetrics.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Trial to paid</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Avg Session Value</p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatCurrency(periodMetrics.revenue / periodMetrics.sessions)}
                </p>
                <p className="text-xs text-muted-foreground">Per session</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};