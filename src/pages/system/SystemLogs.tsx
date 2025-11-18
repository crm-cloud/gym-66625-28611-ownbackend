import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/axios';
import { formatDistanceToNow } from 'date-fns';

export default function SystemLogs() {
  const [filters, setFilters] = useState({
    level: '',
    from_date: '',
    to_date: '',
    limit: 100
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ['system-logs', filters],
    queryFn: async () => {
      const { data } = await api.get('/api/system/logs', { params: filters });
      return data;
    }
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'warning';
      case 'info': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Logs</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Log Level</label>
              <Select value={filters.level} onValueChange={(value) => setFilters({...filters, level: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">From Date</label>
              <Input 
                type="date" 
                value={filters.from_date}
                onChange={(e) => setFilters({...filters, from_date: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium">To Date</label>
              <Input 
                type="date" 
                value={filters.to_date}
                onChange={(e) => setFilters({...filters, to_date: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Entries ({logs?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading logs...</p>
          ) : (
            <div className="space-y-2">
              {logs?.map((log: any, index: number) => (
                <div key={index} className="flex items-start gap-3 border-b pb-2">
                  <Badge variant={getLevelColor(log.level) as any}>{log.level}</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
