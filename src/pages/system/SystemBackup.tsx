
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Download, 
  Upload, 
  Calendar, 
  Clock, 
  HardDrive,
  CheckCircle,
  AlertCircle,
  Play,
  Settings
} from 'lucide-react';
import { BackupSystemIntegration } from '@/components/system/BackupSystemIntegration';
import { useNavigate } from 'react-router-dom';

export default function SystemBackup() {
  const navigate = useNavigate();
  const backupHistory = [
    { id: '1', date: '2024-01-19', time: '02:00 AM', size: '2.4 GB', status: 'completed', type: 'automatic' },
    { id: '2', date: '2024-01-18', time: '02:00 AM', size: '2.3 GB', status: 'completed', type: 'automatic' },
    { id: '3', date: '2024-01-17', time: '02:00 AM', size: '2.4 GB', status: 'completed', type: 'automatic' },
    { id: '4', date: '2024-01-16', time: '11:30 AM', size: '2.4 GB', status: 'completed', type: 'manual' },
    { id: '5', date: '2024-01-15', time: '02:00 AM', size: '2.3 GB', status: 'failed', type: 'automatic' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Backup</h1>
        <p className="text-muted-foreground">Manage database backups and system restoration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Backup</CardTitle>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold text-foreground">Jan 19</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">2:00 AM • 2.4 GB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Backups</CardTitle>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">156</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-secondary" />
              <span className="text-2xl font-bold text-foreground">72 GB</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={72} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">72% of 100 GB</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Backup Settings</CardTitle>
            <CardDescription>Current backup configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Automatic Backups</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Frequency</span>
              <span className="text-sm text-muted-foreground">Daily at 2:00 AM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Retention</span>
              <span className="text-sm text-muted-foreground">30 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Compression</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/system/settings?tab=database')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <BackupSystemIntegration />
    </div>
  );
}
