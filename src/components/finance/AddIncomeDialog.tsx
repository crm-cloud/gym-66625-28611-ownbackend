import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionForm } from './TransactionForm';
import { Transaction } from '@/types/finance';

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function AddIncomeDialog({ open, onOpenChange, onSubmit }: AddIncomeDialogProps) {
  const handleSubmit = (data: any) => {
    onSubmit({
      ...data,
      type: 'income',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Income Transaction</DialogTitle>
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