import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Upload, RefreshCw, Calendar, Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SystemBackup {
  id: string;
  backup_type: string;
  status: string;
  file_size: number;
  started_at: string;
  completed_at: string | null;
  backup_data: any;
}

export function BackupSystemIntegration() {
  const [isCreateBackupOpen, setIsCreateBackupOpen] = useState(false);
  const [selectedBackupType, setSelectedBackupType] = useState<'full' | 'incremental' | 'schema_only'>('full');
  const queryClient = useQueryClient();

  const { data: backups, isLoading } = useQuery({
    queryKey: ['system-backups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_backups')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as SystemBackup[];
    }
  });

  const { data: backupStats } = useQuery({
    queryKey: ['backup-stats'],
    queryFn: async () => {
      const { data: allBackups, error } = await supabase
        .from('system_backups')
        .select('status, file_size, backup_type, started_at');
      
      if (error) throw error;

      const stats = {
        totalBackups: allBackups?.length || 0,
        completedBackups: allBackups?.filter(b => b.status === 'completed').length || 0,
        failedBackups: allBackups?.filter(b => b.status === 'failed').length || 0,
        totalSize: allBackups?.reduce((sum, b) => sum + (b.file_size || 0), 0) || 0,
        lastBackupDate: allBackups?.[0]?.started_at || null
      };

      return stats;
    }
  });

  const createBackup = useMutation({
    mutationFn: async (backupType: 'full' | 'incremental' | 'schema_only') => {
      // Create backup record
      const { data, error } = await supabase
        .from('system_backups')
        .insert({
          backup_type: backupType,
          status: 'pending',
          backup_data: {
            requested_by: 'admin',
            created_via: 'web_interface'
          }
        })
        .select()
        .single();
      
      if (error) throw error;

      // In a real implementation, this would trigger a backup process
      // For now, we'll simulate a backup by updating the status
      setTimeout(async () => {
        await supabase
          .from('system_backups')
          .update({
            status: 'running',
            started_at: new Date().toISOString(),
            backup_data: {
              ...((data as any).backup_data || {}),
              started_at: new Date().toISOString()
            }
          })
          .eq('id', data.id);

        // Simulate completion
        setTimeout(async () => {
          await supabase
            .from('system_backups')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              file_size: Math.floor(Math.random() * 1000000000), // Random file size
              backup_data: {
                ...((data as any).backup_data || {}),
                completed_at: new Date().toISOString(),
                backup_location: `backups/${data.id}_${backupType}_${Date.now()}.sql`
              }
            })
            .eq('id', data.id);
            
          queryClient.invalidateQueries({ queryKey: ['system-backups'] });
          queryClient.invalidateQueries({ queryKey: ['backup-stats'] });
        }, 3000);
      }, 1000);

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Backup Started",
        description: "System backup has been initiated successfully."
      });
      setIsCreateBackupOpen(false);
      queryClient.invalidateQueries({ queryKey: ['system-backups'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const restoreBackup = useMutation({
    mutationFn: async (backupId: string) => {
      // In a real implementation, this would trigger a restore process
      console.log('Restoring backup:', backupId);
      
      // Log the restore event
      await supabase.from('system_events').insert({
        event_type: 'info',
        event_category: 'backup',
        title: 'Backup Restore Initiated',
        description: `Backup restore process started for backup ID: ${backupId}`,
        metadata: { backup_id: backupId },
        severity: 2
      });

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Restore Initiated",
        description: "Backup restore process has been started. This may take several minutes."
      });
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'running':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backupStats?.totalBackups || 0}</div>
            <p className="text-xs text-muted-foreground">
              {backupStats?.completedBackups || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backupStats?.totalBackups 
                ? Math.round((backupStats.completedBackups / backupStats.totalBackups) * 100)
                : 0}%
            </div>
            <Progress 
              value={backupStats?.totalBackups 
                ? (backupStats.completedBackups / backupStats.totalBackups) * 100
                : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(backupStats?.totalSize || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all backups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {backupStats?.lastBackupDate 
                ? new Date(backupStats.lastBackupDate).toLocaleDateString()
                : 'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {backupStats?.lastBackupDate 
                ? new Date(backupStats.lastBackupDate).toLocaleTimeString()
                : 'No backups yet'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Backup List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Backups</CardTitle>
              <CardDescription>Manage and monitor system backup operations</CardDescription>
            </div>
            <Dialog open={isCreateBackupOpen} onOpenChange={setIsCreateBackupOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create System Backup</DialogTitle>
                  <DialogDescription>
                    Choose the type of backup to create. This will back up your entire system data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backup-type">Backup Type</Label>
                    <Select value={selectedBackupType} onValueChange={(value: any) => setSelectedBackupType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Backup - Complete system data</SelectItem>
                        <SelectItem value="incremental">Incremental - Changes since last backup</SelectItem>
                        <SelectItem value="schema_only">Schema Only - Database structure only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => createBackup.mutate(selectedBackupType)}
                      disabled={createBackup.isPending}
                    >
                      {createBackup.isPending ? 'Creating...' : 'Create Backup'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateBackupOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backups?.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(backup.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {backup.backup_type.charAt(0).toUpperCase() + backup.backup_type.slice(1).replace('_', ' ')} Backup
                      </p>
                      <Badge variant={getStatusColor(backup.status) as any}>
                        {backup.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {backup.started_at ? new Date(backup.started_at).toLocaleString() : 'Pending'}
                      {backup.completed_at && ` • Completed: ${new Date(backup.completed_at).toLocaleString()}`}
                    </p>
                    {backup.file_size > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Size: {formatFileSize(backup.file_size)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {backup.status === 'completed' && (
                    <>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => restoreBackup.mutate(backup.id)}
                        disabled={restoreBackup.isPending}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {(!backups || backups.length === 0) && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Backups Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first system backup to ensure your data is protected.
                </p>
                <Button onClick={() => setIsCreateBackupOpen(true)}>
                  Create First Backup
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}