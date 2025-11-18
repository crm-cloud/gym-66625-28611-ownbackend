import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Logs</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Audit logging system will be implemented in Phase 2. This will track all super admin actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
