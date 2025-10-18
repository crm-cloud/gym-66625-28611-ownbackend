
import { MapPin, ChevronDown, Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBranches } from '@/hooks/useBranches';
import { cn } from '@/lib/utils';

export const BranchSelector = () => {
  const { branches, selectedBranch, setSelectedBranch } = useBranches();

  const handleBranchChange = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    setSelectedBranch(branch || null);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'maintenance': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'secondary';
    }
  };

  if (!selectedBranch) return null;

  return (
    <div className="relative group">
      <Select value={selectedBranch?.id || ''} onValueChange={handleBranchChange}>
        <SelectTrigger className={cn(
          "w-72 h-10 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors",
          "focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:outline-none flex items-center justify-between"
        )}>
          <div className="flex items-center gap-2.5 w-full">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{selectedBranch?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {selectedBranch?.address.city}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
          </div>
        </SelectTrigger>
        <SelectContent className="w-[--radix-select-trigger-width] p-1.5">
          {branches.map((branch) => (
            <SelectItem 
              key={branch.id} 
              value={branch.id}
              className="py-2.5 px-3 rounded-md hover:bg-accent/50 data-[state=checked]:bg-accent/30"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{branch.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">
                      {branch.address.city}, {branch.address.state}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={getStatusVariant(branch.status)} 
                  className="ml-2 text-[10px] font-medium px-1.5 py-0.5 h-5"
                >
                  {branch.status}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
