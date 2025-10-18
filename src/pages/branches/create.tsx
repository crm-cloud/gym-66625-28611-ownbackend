import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BranchForm } from '@/components/branches/BranchForm';

export function BranchCreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Branch</h1>
        <p className="text-muted-foreground">Add a new gym branch location to your network</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Information</CardTitle>
          <CardDescription>
            Fill in the details below to create a new branch location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BranchForm />
        </CardContent>
      </Card>
    </div>
  );
}