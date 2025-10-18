import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleForm } from '@/components/roles/RoleForm';

export function RoleCreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Role</h1>
        <p className="text-muted-foreground">Define a new role with specific permissions and access controls</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Configuration</CardTitle>
          <CardDescription>
            Configure the role details and assign appropriate permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm />
        </CardContent>
      </Card>
    </div>
  );
}