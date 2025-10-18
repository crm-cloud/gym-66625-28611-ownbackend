
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@/types/finance';
import { TransactionTable } from '@/components/finance/TransactionTable';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Download, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PermissionGate } from '@/components/PermissionGate';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetchTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      category:category_id (id, name, type),
      paymentMethod:payment_method_id (id, name)
    `)
    .order('date', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(t => ({
    id: t.id,
    amount: t.amount,
    type: t.type as 'income' | 'expense',
    status: t.status as 'completed' | 'pending' | 'cancelled',
    date: typeof t.date === 'string' ? t.date : new Date(t.date).toISOString().split('T')[0],
    description: t.description,
    reference: t.reference || '',
    category: {
      id: t.category?.id || '',
      name: t.category?.name || 'Uncategorized',
      type: (t.category?.type as 'income' | 'expense') || 'expense',
      color: '',
      icon: '',
      isActive: true
    },
    paymentMethod: {
      id: t.paymentMethod?.id || '',
      name: t.paymentMethod?.name || 'Unknown',
      type: 'cash' as const,
      isActive: true
    },
    memberId: t.member_id,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  }));
};

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: startOfMonth(today),
      to: today,
    };
  });
  const [dateFilter, setDateFilter] = useState<string>('thisMonth');

  // Handle predefined date ranges
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    const today = new Date();
    const yesterdayDate = subDays(today, 1);
    
    switch (value) {
      case 'today':
        setDateRange({ from: today, to: today });
        break;
      case 'yesterday':
        setDateRange({ from: yesterdayDate, to: yesterdayDate });
        break;
      case 'thisWeek':
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      case 'thisMonth':
        setDateRange({ from: startOfMonth(today), to: today });
        break;
      case 'lastMonth':
        const firstDayLastMonth = startOfMonth(subDays(startOfMonth(today), 1));
        const lastDayLastMonth = endOfMonth(subDays(today, today.getDate()));
        setDateRange({ from: firstDayLastMonth, to: lastDayLastMonth });
        break;
      case 'custom':
        // Keep the current date range when custom is selected
        break;
    }
  };

  // Fetch transactions
  const { data: allTransactions = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    refetchOnWindowFocus: true
  });

  // Use transactions directly from query (already properly formatted)
  const transactions = allTransactions || [];

  // Filter transactions based on date range
  const filterTransactionsByDate = useCallback((transactions: Transaction[]) => {
    if (!dateRange?.from || !dateRange?.to) return transactions;
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, { 
        start: dateRange.from!, 
        end: dateRange.to! 
      });
    });
  }, [dateRange]);

  // Get filtered transactions (already have correct date format from fetch)
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByDate(transactions);
  }, [transactions, filterTransactionsByDate]);

  // Calculate summary data
  const summaryData = useMemo(() => {
    const filtered = filterTransactionsByDate(transactions);
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = income - expenses;
    return { income, expenses, netBalance, transactionCount: filtered.length };
  }, [transactions, filterTransactionsByDate]);

  useEffect(() => {
    // Set up real-time subscription
    const subscription = supabase
      .channel('transactions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const handleAddTransaction = async (data: any) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          amount: data.amount,
          type: data.type,
          description: data.description,
          date: data.date,
          category_id: data.categoryId,
          payment_method_id: data.paymentMethodId,
          status: 'completed',
          reference: data.reference || null,
          member_id: data.memberId || null,
          member_name: data.memberName || null,
          invoice_id: data.invoiceId || null
        }]);

      if (error) throw error;

      await refetch();
      toast({
        title: "Transaction Added",
        description: "The transaction has been successfully recorded.",
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowForm(true);
  };

  const handleUpdateTransaction = async (data: any) => {
    if (!selectedTransaction) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: data.amount,
          type: data.type,
          description: data.description,
          date: data.date,
          category_id: data.categoryId,
          payment_method_id: data.paymentMethodId,
          status: data.status || 'completed',
          reference: data.reference || null,
          member_id: data.memberId || null,
          member_name: data.memberName || null,
          invoice_id: data.invoiceId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTransaction.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Transaction Updated",
        description: "The transaction has been successfully updated.",
      });
      setSelectedTransaction(undefined);
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;

      await refetch();
      toast({
        title: "Transaction Deleted",
        description: "The transaction has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .csv();

      if (error) throw error;

      // Create a download link
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Completed",
        description: "Your transactions have been exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export transactions. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage all financial transactions for your gym</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportTransactions}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <PermissionGate permission="finance.create">
            <Button 
              onClick={() => setShowForm(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Period:</span>
          <Select value={dateFilter} onValueChange={handleDateFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Date Range:</span>
            <div className={cn("grid gap-2")}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Today's Income</h3>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(
                transactions
                  .filter(t => 
                    t.type === 'income' && 
                    new Date(t.date).toDateString() === new Date().toDateString()
                  )
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {transactions.filter(t => t.type === 'income' && new Date(t.date).toDateString() === new Date().toDateString()).length} transactions
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Today's Expenses</h3>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(
                transactions
                  .filter(t => 
                    t.type === 'expense' && 
                    new Date(t.date).toDateString() === new Date().toDateString()
                  )
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {transactions.filter(t => t.type === 'expense' && new Date(t.date).toDateString() === new Date().toDateString()).length} transactions
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Net Balance</h3>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(
                transactions.reduce((sum, t) => {
                  const amount = t.type === 'income' ? t.amount : -t.amount;
                  return sum + amount;
                }, 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {transactions.length} total transactions
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-destructive">Error loading transactions. Please try again.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <TransactionTable
          transactions={filteredTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onExport={handleExportTransactions}
        />
      )}

      {/* Transaction Form */}
      <PermissionGate permission="finance.create">
        <TransactionForm
          open={showForm}
          onOpenChange={setShowForm}
          transaction={selectedTransaction}
          onSubmit={selectedTransaction ? handleUpdateTransaction : handleAddTransaction}
        />
      </PermissionGate>
    </div>
  );
}
