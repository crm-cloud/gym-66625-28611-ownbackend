import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Search, 
  Edit, 
  Settings,
  Users,
  MapPin,
  Phone,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function BranchListTable() {
  const { authState } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: branches = [], isLoading, error } = useQuery({
    queryKey: ['admin-branches-table', authState.user?.gym_id],
    queryFn: async () => {
      if (!authState.user?.gym_id) return [];
      
      // First, fetch the branches
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*')
        .eq('gym_id', authState.user.gym_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (branchesError) {
        console.error('Error fetching branches:', branchesError);
        throw branchesError;
      }

      // Then fetch manager profiles in a separate query
      const managerIds = branchesData
        .map(branch => branch.manager_id)
        .filter((id): id is string => !!id);

      let managers = {};
      
      if (managerIds.length > 0) {
        const { data: managersData, error: managersError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', managerIds);
          
        if (managersError) {
          console.error('Error fetching managers:', managersError);
        } else {
          // Create a map of manager_id -> manager data
          managers = managersData.reduce((acc, manager) => ({
            ...acc,
            [manager.id]: manager
          }), {});
        }
      }
      
      // Combine the data
      return branchesData.map(branch => ({
        ...branch,
        manager: branch.manager_id ? managers[branch.manager_id] : null
      })) || [];
    },
    enabled: !!authState.user?.gym_id,
    retry: 2,
  });

  const filteredBranches = React.useMemo(() => {
    if (!branches || branches.length === 0) return [];
    
    const searchLower = searchTerm.toLowerCase();
    return branches.filter(branch => {
      const name = branch.name?.toLowerCase() || '';
      const address = branch.address as any;
      const city = address?.city?.toLowerCase() || '';
      const state = address?.state?.toLowerCase() || '';
      const managerName = branch.manager?.full_name?.toLowerCase() || '';
      
      return name.includes(searchLower) || 
             city.includes(searchLower) || 
             state.includes(searchLower) ||
             managerName.includes(searchLower);
    });
  }, [branches, searchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Branches</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'Failed to load branches. Please try again.'}
        </p>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold w-[200px]">Branch Name</TableHead>
              <TableHead className="font-semibold w-[100px]">Code</TableHead>
              <TableHead className="font-semibold w-[250px]">Address</TableHead>
              <TableHead className="font-semibold w-[120px] text-center">Members</TableHead>
              <TableHead className="font-semibold w-[100px] text-center">Capacity</TableHead>
              <TableHead className="font-semibold w-[200px]">Manager</TableHead>
              <TableHead className="font-semibold w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBranches.map((branch, index) => {
              const address = branch.address as any;
              const contact = branch.contact as any;
              
              return (
                <motion.tr
                  key={branch.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {branch.name}
                      </div>
                      {contact?.phone && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {branch.name?.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 4) || 'N/A'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {address?.street ? `${address.street}` : 'Address not set'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {address?.city && address?.state ? `${address.city}, ${address.state} ${address.zipCode || ''}` : 'Location not complete'}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-secondary" />
                      <span className="font-medium">{branch.current_members || 0}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="secondary">
                      {branch.capacity || 'Not set'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {branch.manager ? (
                        <>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={branch.manager.avatar_url || ''} alt={branch.manager.full_name} />
                            <AvatarFallback>
                              {branch.manager.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {branch.manager.full_name || 'Unnamed'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                              {branch.manager.email || 'No email'}
                            </div>
                          </div>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Not assigned
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Branch
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Assign Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Branch
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredBranches.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center py-12"
        >
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Branches Found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first branch to get started'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}