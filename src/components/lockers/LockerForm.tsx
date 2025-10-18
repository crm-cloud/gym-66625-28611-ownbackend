import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Locker, LockerStatus } from '@/types/locker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LockerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locker?: Locker;
  onSubmit: (data: any) => void;
  branches: { id: string; name: string; }[];
}

export function LockerForm({ 
  open, 
  onOpenChange, 
  locker, 
  onSubmit, 
  branches 
}: LockerFormProps) {
  // Fetch locker sizes from database
  const { data: lockerSizes = [] } = useQuery({
    queryKey: ['locker_sizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locker_sizes')
        .select('*')
        .order('monthly_fee', { ascending: true});
      if (error) throw error;
      return data || [];
    }
  });

  const [formData, setFormData] = useState({
    name: locker?.name || '',
    number: locker?.number || '',
    branchId: locker?.branchId || '',
    sizeId: locker?.size.id || '',
    status: locker?.status || 'available' as LockerStatus,
    monthlyFee: locker?.monthlyFee || 0,
    notes: locker?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSize = lockerSizes.find(s => s.id === formData.sizeId);
    if (!selectedSize) return;

    onSubmit({
      ...formData,
      size: selectedSize,
      branchName: branches.find(b => b.id === formData.branchId)?.name || '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {locker ? 'Edit Locker' : 'Add New Locker'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Locker Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Locker A1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Locker Number</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="e.g., A001"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branchId">Branch</Label>
            <Select
              value={formData.branchId}
              onValueChange={(value) => setFormData({ ...formData, branchId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sizeId">Size</Label>
              <Select
                value={formData.sizeId}
                onValueChange={(value) => setFormData({ ...formData, sizeId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                  <SelectContent>
                    {lockerSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name} - ${size.monthly_fee}/month
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as LockerStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyFee">Monthly Fee ($)</Label>
            <Input
              id="monthlyFee"
              type="number"
              value={formData.monthlyFee}
              onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this locker"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {locker ? 'Update' : 'Add'} Locker
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}