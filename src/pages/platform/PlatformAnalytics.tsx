import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export default function PlatformAnalytics() {
  const { data: analytics } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/api/platform/analytics');
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform Analytics</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Growth chart coming soon...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Revenue chart coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
