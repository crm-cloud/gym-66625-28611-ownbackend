
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Settings 
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface QuickActionsProps {
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  onCreateInvoice?: () => void;
  onViewReports?: () => void;
  onManageCategories?: () => void;
}

export function QuickActions({
  onAddIncome,
  onAddExpense,
  onCreateInvoice,
  onViewReports,
  onManageCategories,
}: QuickActionsProps) {
  
  const handleAddIncome = () => {
    if (onAddIncome) {
      onAddIncome();
    } else {
      toast({
        title: "Add Income",
        description: "Income recording feature will be available soon.",
      });
    }
  };

  const handleAddExpense = () => {
    if (onAddExpense) {
      onAddExpense();
    } else {
      toast({
        title: "Add Expense",
        description: "Expense recording feature will be available soon.",
      });
    }
  };

  const handleCreateInvoice = () => {
    if (onCreateInvoice) {
      onCreateInvoice();
    } else {
      toast({
        title: "Create Invoice",
        description: "Invoice creation feature will be available soon.",
      });
    }
  };

  const handleViewReports = () => {
    if (onViewReports) {
      onViewReports();
    } else {
      toast({
        title: "View Reports",
        description: "Financial reports feature will be available soon.",
      });
    }
  };

  const handleManageCategories = () => {
    if (onManageCategories) {
      onManageCategories();
    } else {
      toast({
        title: "Manage Categories",
        description: "Category management feature will be available soon.",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={handleAddIncome}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Add Income
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleAddExpense}
            className="flex items-center gap-2"
          >
            <TrendingDown className="w-4 h-4" />
            Add Expense
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleCreateInvoice}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Create Invoice
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleViewReports}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            View Reports
          </Button>
          
          <Button 
            variant="ghost"
            onClick={handleManageCategories}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Manage Categories
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
