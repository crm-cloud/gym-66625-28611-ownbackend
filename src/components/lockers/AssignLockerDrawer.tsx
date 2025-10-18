import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Key, User } from 'lucide-react';
import { useLockers } from '@/hooks/useLockers';
import { useMembers } from '@/hooks/useMembers';
import { LockerStatusBadge } from './LockerStatusBadge';

interface AssignLockerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  branchId?: string;
  onAssign: (data: any) => void;
}

export function AssignLockerDrawer({
  open,
  onOpenChange,
  memberId,
  memberName,
  branchId,
  onAssign,
}: AssignLockerDrawerProps) {
  const [selectedLockerId, setSelectedLockerId] = useState('');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  const { data: lockers = [] } = useLockers(branchId);
  
  // Filter available lockers
  const availableLockers = lockers.filter(locker => 
    locker.status === 'available' &&
    (locker.number.toLowerCase().includes(search.toLowerCase()) ||
     locker.name.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedLocker = lockers.find(l => l.id === selectedLockerId);

  const handleAssign = () => {
    if (!selectedLocker) return;

    onAssign({
      lockerId: selectedLocker.id,
      memberId,
      memberName,
      notes,
      expirationDate: expirationDate || undefined,
      monthlyFee: selectedLocker.monthlyFee,
    });

    onOpenChange(false);
    setSelectedLockerId('');
    setNotes('');
    setExpirationDate('');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Assign Locker to {memberName}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Lockers</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by locker number or name..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Available Lockers */}
          <div className="space-y-3">
            <Label>Available Lockers ({availableLockers.length})</Label>
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {availableLockers.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    No available lockers found
                  </CardContent>
                </Card>
              ) : (
                availableLockers.map((locker) => (
                  <Card
                    key={locker.id}
                    className={`cursor-pointer transition-colors ${
                      selectedLockerId === locker.id 
                        ? 'ring-2 ring-primary bg-muted/50' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedLockerId(locker.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          <span className="font-medium">{locker.number}</span>
                          <span className="text-sm text-muted-foreground">
                            ({locker.name})
                          </span>
                        </div>
                        <LockerStatusBadge status={locker.status} />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            Size: <Badge variant="outline">{locker.size.name}</Badge>
                          </span>
                          <span className="text-muted-foreground">
                            Branch: {locker.branchName}
                          </span>
                        </div>
                        <span className="font-medium">${locker.monthlyFee}/month</span>
                      </div>
                      
                      {locker.notes && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {locker.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Assignment Details */}
          {selectedLocker && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Assignment Details
              </h3>
              
              <div className="grid gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Member:</span>
                  <span className="font-medium">{memberName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Locker:</span>
                  <span className="font-medium">{selectedLocker.number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Fee:</span>
                  <span className="font-medium">${selectedLocker.monthlyFee}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration">Expiration Date (Optional)</Label>
                <Input
                  id="expiration"
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Assignment Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes for this assignment..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedLockerId}
            >
              Assign Locker
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}