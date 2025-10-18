import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Trash2, Users, Shield } from 'lucide-react';
import type { RoleWithCount } from '@/hooks/useRolesManagement';

interface RoleCardProps {
  role: RoleWithCount;
  onEdit: () => void;
  onDelete: () => void;
}

export const RoleCard = ({ role, onEdit, onDelete }: RoleCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: role.color + '20' }}
            >
              <Shield className="w-6 h-6" style={{ color: role.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{role.display_name}</h3>
              {role.is_system && (
                <Badge variant="secondary" className="text-xs mt-1">
                  System Role
                </Badge>
              )}
            </div>
          </div>
          {!role.is_system && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Role
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {role.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </span>
            <span className="font-semibold">{role.user_count}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permissions
            </span>
            <span className="font-semibold">{role.permission_count}</span>
          </div>
        </div>

        <Button
          variant={role.is_system ? "outline" : "default"}
          className="w-full mt-4"
          onClick={onEdit}
        >
          <Edit className="w-4 h-4 mr-2" />
          {role.is_system ? 'View Permissions' : 'Edit Permissions'}
        </Button>
      </CardContent>
    </Card>
  );
};
