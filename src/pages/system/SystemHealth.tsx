
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useSystemEvents, useSystemMetrics, usePerformanceMetrics } from '@/hooks/useSystemHealth';
import { formatDistanceToNow } from 'date-fns';

export default function SystemHealth() {
  const { data: systemEvents, isLoading: eventsLoading } = useSystemEvents();
  const { data: systemMetrics, isLoading: metricsLoading } = useSystemMetrics();
  const { data: performanceMetrics, isLoading: performanceLoading } = usePerformanceMetrics();

  if (eventsLoading || metricsLoading || performanceLoading) {
    return <div className="flex items-center justify-center h-64">Loading system health data...</div>;
  }

  const healthMetrics = [
    { 
      name: 'Server Status', 
      value: systemMetrics?.server?.status === 'healthy' ? 'Online' : 'Issues Detected', 
      status: systemMetrics?.server?.status || 'healthy', 
      icon: Server 
    },
    { 
      name: 'Database', 
      value: `${systemMetrics?.server?.uptime || '99.9%'} Uptime`, 
      status: systemMetrics?.database?.status || 'healthy', 
      icon: Database 
    },
    { 
      name: 'Network', 
      value: systemMetrics?.network?.status === 'healthy' ? 'Stable' : 'Unstable', 
      status: systemMetrics?.network?.status || 'healthy', 
      icon: Wifi 
    },
    { 
      name: 'Storage', 
      value: `${systemMetrics?.storage?.used || 78}% Used`, 
      status: systemMetrics?.storage?.status || 'warning', 
      icon: HardDrive 
    },
    { 
      name: 'CPU Usage', 
      value: `${systemMetrics?.cpu?.usage || 45}%`, 
      status: systemMetrics?.cpu?.status || 'healthy', 
      icon: Cpu 
    },
    { 
      name: 'Memory', 
      value: `${systemMetrics?.memory?.usage || 62}%`, 
      status: systemMetrics?.memory?.status || 'healthy', 
      icon: Activity 
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Health</h1>
        <p className="text-muted-foreground">Monitor system performance and health metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon;
          const isHealthy = metric.status === 'healthy';
          
          return (
            <Card key={metric.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-sm">{metric.name}</CardTitle>
                  </div>
                  {isHealthy ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{metric.value}</span>
                  <Badge variant={isHealthy ? 'secondary' : 'destructive'}>
                    {metric.status}
                  </Badge>
                </div>
                {metric.name === 'Storage' && (
                  <Progress value={systemMetrics?.storage?.used || 78} className="mt-2" />
                )}
                {metric.name === 'CPU Usage' && (
                  <Progress value={systemMetrics?.cpu?.usage || 45} className="mt-2" />
                )}
                {metric.name === 'Memory' && (
                  <Progress value={systemMetrics?.memory?.usage || 62} className="mt-2" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent System Events</CardTitle>
            <CardDescription>Latest system activities and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemEvents?.slice(0, 4).map((event, index) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.event_type === 'success' ? 'bg-green-500' :
                  event.event_type === 'warning' ? 'bg-yellow-500' : 
                  event.event_type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )) || [
              { time: '2 minutes ago', event: 'Database backup completed successfully', type: 'success' },
              { time: '1 hour ago', event: 'High CPU usage detected', type: 'warning' },
              { time: '3 hours ago', event: 'System maintenance completed', type: 'info' },
              { time: '6 hours ago', event: 'New user registration spike detected', type: 'info' }
            ].map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.type === 'success' ? 'bg-green-500' :
                  event.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.event}</p>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>System performance over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Response Time</span>
                <span>{performanceMetrics?.responseTime?.avg || 125}ms avg</span>
              </div>
              <Progress value={75} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Throughput</span>
                <span>{performanceMetrics?.throughput?.current || 1250} req/min</span>
              </div>
              <Progress value={85} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Error Rate</span>
                <span>{performanceMetrics?.errorRate?.current || 0.02}%</span>
              </div>
              <Progress value={2} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
