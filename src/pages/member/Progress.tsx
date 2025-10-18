import { useState } from 'react';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Weight, Activity, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const MemberProgress = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    notes: ''
  });
  
  const { data: member, isLoading: memberLoading } = useMemberProfile();
  
  const { data: measurements, isLoading: measurementsLoading } = useSupabaseQuery(
    ['member-measurements', member?.id],
    async () => {
      if (!member?.id) throw new Error('Member not found');
      
      const { data, error } = await supabase
        .from('member_measurements')
        .select('*')
        .eq('member_id', member.id)
        .order('measured_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!member?.id
    }
  );

  if (memberLoading || measurementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">Member profile not found.</p>
      </div>
    );
  }

  const chartData = measurements?.map(m => ({
    date: format(new Date(m.measured_date), 'MMM dd'),
    weight: m.weight,
    bodyFat: m.body_fat_percentage,
    muscleMass: m.muscle_mass,
    bmi: m.bmi
  })) || [];

  const latestMeasurement = measurements?.[measurements.length - 1];
  const firstMeasurement = measurements?.[0];

  const weightChange = latestMeasurement && firstMeasurement 
    ? (latestMeasurement.weight || 0) - (firstMeasurement.weight || 0)
    : 0;

  const bodyFatChange = latestMeasurement && firstMeasurement
    ? (latestMeasurement.body_fat_percentage || 0) - (firstMeasurement.body_fat_percentage || 0)
    : 0;

  const { mutate: recordMeasurement, isPending: isSaving } = useSupabaseMutation(
    async (data: any) => {
      const { error } = await supabase.from('member_measurements').insert({
        member_id: member?.id,
        measured_by: member?.user_id,
        measured_date: new Date().toISOString().split('T')[0],
        weight: data.weight ? parseFloat(data.weight) : null,
        body_fat_percentage: data.bodyFat ? parseFloat(data.bodyFat) : null,
        muscle_mass: data.muscleMass ? parseFloat(data.muscleMass) : null,
        chest: data.chest ? parseFloat(data.chest) : null,
        waist: data.waist ? parseFloat(data.waist) : null,
        hips: data.hips ? parseFloat(data.hips) : null,
        arms: data.arms ? parseFloat(data.arms) : null,
        thighs: data.thighs ? parseFloat(data.thighs) : null,
        notes: data.notes || null
      });
      if (error) throw error;
    },
    {
      onSuccess: () => {
        toast({ title: 'Measurement recorded successfully!' });
        setOpen(false);
        setFormData({
          weight: '', bodyFat: '', muscleMass: '', chest: '', waist: '',
          hips: '', arms: '', thighs: '', notes: ''
        });
      },
      invalidateQueries: [['member-measurements', member?.id]]
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.weight) {
      toast({ title: 'Weight is required', variant: 'destructive' });
      return;
    }
    recordMeasurement(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Progress</h1>
          <p className="text-muted-foreground">Track your fitness journey and measurements</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Measurement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record New Measurement</DialogTitle>
              <DialogDescription>
                Log your current measurements to track your progress
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Body Fat %</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={(e) => setFormData({...formData, bodyFat: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="muscleMass">Muscle Mass (kg)</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    value={formData.muscleMass}
                    onChange={(e) => setFormData({...formData, muscleMass: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chest">Chest (cm)</Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.1"
                    value={formData.chest}
                    onChange={(e) => setFormData({...formData, chest: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">Waist (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    value={formData.waist}
                    onChange={(e) => setFormData({...formData, waist: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hips">Hips (cm)</Label>
                  <Input
                    id="hips"
                    type="number"
                    step="0.1"
                    value={formData.hips}
                    onChange={(e) => setFormData({...formData, hips: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arms">Arms (cm)</Label>
                  <Input
                    id="arms"
                    type="number"
                    step="0.1"
                    value={formData.arms}
                    onChange={(e) => setFormData({...formData, arms: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thighs">Thighs (cm)</Label>
                  <Input
                    id="thighs"
                    type="number"
                    step="0.1"
                    value={formData.thighs}
                    onChange={(e) => setFormData({...formData, thighs: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any notes about your progress..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? 'Saving...' : 'Save Measurement'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : 'N/A'}
            </div>
            {weightChange !== 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {weightChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                {Math.abs(weightChange).toFixed(1)} kg from start
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Fat %</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMeasurement?.body_fat_percentage 
                ? `${latestMeasurement.body_fat_percentage}%` 
                : 'N/A'}
            </div>
            {bodyFatChange !== 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {bodyFatChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                {Math.abs(bodyFatChange).toFixed(1)}% from start
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BMI</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMeasurement?.bmi ? latestMeasurement.bmi.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Body Mass Index</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Muscle Mass</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMeasurement?.muscle_mass 
                ? `${latestMeasurement.muscle_mass} kg` 
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Current muscle mass</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weight Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Weight (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="bodyFat" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    name="Body Fat %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="muscleMass" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Muscle Mass (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Measurements Yet</h3>
            <p className="text-muted-foreground text-center">
              Your progress measurements will appear here once they are recorded by staff.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
