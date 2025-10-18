import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionForm } from './TransactionForm';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function AddExpenseDialog({ open, onOpenChange, onSubmit }: AddExpenseDialogProps) {
  const handleSubmit = (data: any) => {
    onSubmit({
      ...data,
      type: 'expense',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Expense Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          open={true}
          onOpenChange={() => {}}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}