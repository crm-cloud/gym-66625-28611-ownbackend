
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Transaction } from '@/types/finance';
import { ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewTransaction?: (transaction: Transaction) => void;
}

export function RecentTransactions({ 
  transactions, 
  onViewTransaction 
}: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Member</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium whitespace-nowrap">
              {format(new Date(transaction.date), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell className="font-medium">
              {transaction.memberName || '-'}
            </TableCell>
            <TableCell>
              <div className="font-medium">{transaction.description}</div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: transaction.category.color }}
                />
                {transaction.category.name}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {transaction.type === 'income' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                )}
                <span className={`capitalize ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right font-medium">
              <span className={
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </span>
            </TableCell>
            <TableCell>
              {getStatusBadge(transaction.status)}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewTransaction?.(transaction)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
