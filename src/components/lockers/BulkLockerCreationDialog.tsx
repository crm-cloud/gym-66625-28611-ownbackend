import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Key, Plus } from 'lucide-react';
import { useBulkCreateLockers } from '@/hooks/useLockers';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

interface BulkLockerCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
}

export function BulkLockerCreationDialog({
  open,
  onOpenChange,
  branchId
}: BulkLockerCreationDialogProps) {
  const [count, setCount] = useState<number>(10);
  const [startNumber, setStartNumber] = useState<number>(1);
  const [prefix, setPrefix] = useState<string>('');
  const [sizeId, setSizeId] = useState<string>('');

  const { data: lockerSizes = [] } = useSupabaseQuery(
    ['locker-sizes'],
    async () => {
      const { data, error } = await supabase
        .from('locker_sizes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  );

  const bulkCreateMutation = useBulkCreateLockers();

  const handleCreate = () => {
    if (!sizeId || count <= 0) return;

    bulkCreateMutation.mutate({
      count,
      branchId,
      sizeId,
      startNumber,
      prefix: prefix.trim()
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setCount(10);
        setStartNumber(1);
        setPrefix('');
        setSizeId('');
      }
    });
  };

  const previewNumbers = Array.from({ length: Math.min(count, 5) }, (_, index) => 
    `${prefix}${startNumber + index}`
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Bulk Create Lockers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Count Input */}
          <div className="space-y-2">
            <Label htmlFor="count">Number of Lockers</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              placeholder="Enter number of lockers (1-100)"
            />
            <p className="text-xs text-muted-foreground">
              Maximum 100 lockers can be created at once
            </p>
          </div>

          {/* Prefix Input */}
          <div className="space-y-2">
            <Label htmlFor="prefix">Prefix (Optional)</Label>
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g., A, B1, Floor2-"
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Add a prefix to locker numbers (e.g., A1, B1-1, etc.)
            </p>
          </div>

          {/* Start Number */}
          <div className="space-y-2">
            <Label htmlFor="startNumber">Starting Number</Label>
            <Input
              id="startNumber"
              type="number"
              min="1"
              value={startNumber}
              onChange={(e) => setStartNumber(Number(e.target.value))}
            />
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <Label>Locker Size</Label>
            <Select value={sizeId} onValueChange={setSizeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select locker size" />
              </SelectTrigger>
              <SelectContent>
                {lockerSizes.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{size.name} ({size.dimensions})</span>
                      <Badge variant="outline" className="ml-2">
                        ${size.monthly_fee}/mo
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {count > 0 && (
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {previewNumbers.map((number, index) => (
                      <Badge key={index} variant="secondary">
                        {number}
                      </Badge>
                    ))}
                    {count > 5 && (
                      <Badge variant="outline">
                        +{count - 5} more
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {count} lockers will be created: {prefix}{startNumber} to {prefix}{startNumber + count - 1}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {bulkCreateMutation.isPending && (
            <div className="space-y-2">
              <Label>Creating lockers...</Label>
              <Progress value={75} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Please wait while we create your lockers
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={bulkCreateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!sizeId || count <= 0 || bulkCreateMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create {count} Lockers
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}