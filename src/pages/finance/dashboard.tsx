
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  Calendar,
  Plus,
  FileText,
  CreditCard
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FinanceOverviewCards } from '@/components/finance/FinanceOverviewCards';
import { MonthlyTrendChart } from '@/components/finance/MonthlyTrendChart';
import { CategoryBreakdownChart } from '@/components/finance/CategoryBreakdownChart';
import { RecentTransactions } from '@/components/finance/RecentTransactions';
import { QuickActions } from '@/components/finance/QuickActions';
import { TransactionTable } from '@/components/finance/TransactionTable';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { AddIncomeDialog } from '@/components/finance/AddIncomeDialog';
import { AddExpenseDialog } from '@/components/finance/AddExpenseDialog';
import { InvoiceCreationDialog } from '@/components/finance/InvoiceCreationDialog';
import { CategoryManagementDialog } from '@/components/finance/CategoryManagementDialog';
import { PermissionGate } from '@/components/PermissionGate';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useBranchContext } from '@/hooks/useBranchContext';

export default function FinanceDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'half-yearly' | 'yearly'>('monthly');
  const [selectedBranch, setSelectedBranch] = useState<string | 'all'>('all');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentBranchId, getAccessibleBranches } = useBranchContext();

  // Fetch transactions from Supabase
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', selectedBranch],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          transaction_categories(name, type, color),
          payment_methods(name, type)
        `)
        .order('date', { ascending: false });
      
      if (selectedBranch !== 'all') {
        query = query.eq('branch_id', selectedBranch);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch monthly analytics - simplified version
  const { data: monthlyData = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-analytics', selectedBranch],
    queryFn: async () => {
      // Fallback calculation - get transactions grouped by month
      let query = supabase
        .from('transactions')
        .select('date, type, amount')
        .gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
      
      if (selectedBranch !== 'all') {
        query = query.eq('branch_id', selectedBranch);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Process data to monthly format
      const monthlyMap: Record<string, {month: string, income: number, expenses: number, profit: number}> = {};
      
      (data || []).forEach((transaction: any) => {
        const date = new Date(transaction.date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { month: monthKey, income: 0, expenses: 0, profit: 0 };
        }
        
        if (transaction.type === 'income') {
          monthlyMap[monthKey].income += Number(transaction.amount);
        } else {
          monthlyMap[monthKey].expenses += Number(transaction.amount);
        }
        monthlyMap[monthKey].profit = monthlyMap[monthKey].income - monthlyMap[monthKey].expenses;
      });
      
      return Object.values(monthlyMap);
    },
  });

  // Initialize selected branch with current context branch if available
  // Users can switch to "All Branches" to aggregate
  useMemo(() => {
    if (currentBranchId && selectedBranch === 'all') {
      setSelectedBranch(currentBranchId);
    }
  }, [currentBranchId]);

  // Transform transactions for UI consumption
  const filteredTransactions = useMemo(() => {
    return transactions.map((t: any) => ({
      id: t.id,
      date: t.date,
      type: t.type,
      category: {
        id: t.transaction_categories?.id || '',
        name: t.transaction_categories?.name || 'Uncategorized',
        type: t.transaction_categories?.type || t.type,
        color: t.transaction_categories?.color || '#6B7280',
        icon: 'DollarSign',
        isActive: true
      },
      amount: Number(t.amount),
      description: t.description || '',
      paymentMethod: {
        id: t.payment_methods?.id || '',
        name: t.payment_methods?.name || 'Unknown',
        type: t.payment_methods?.type || 'other',
        isActive: true
      },
      reference: t.reference,
      memberId: t.member_id,
      memberName: t.member_name,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at
    }));
  }, [transactions]);

  const filteredMonthly = useMemo(() => {
    return monthlyData;
  }, [monthlyData]);

  // Aggregate monthly data by selected period for the Package Analytics line chart
  const chartDataForPeriod = useMemo(() => {
    const source = filteredMonthly;
    if (!Array.isArray(source) || source.length === 0) return [];
    if (selectedPeriod === 'monthly') return source;

    const monthToQuarter = (month: string) => {
      const idx = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].findIndex(m => m === month);
      if (idx < 0) return 'Q1';
      const q = Math.floor(idx / 3) + 1;
      return `Q${q}`;
    };

    if (selectedPeriod === 'quarterly') {
      const map: Record<string, { month: string; income: number; expenses: number; profit: number }>
        = {};
      for (const m of source as any[]) {
        const q = monthToQuarter(m.month);
        if (!map[q]) map[q] = { month: q, income: 0, expenses: 0, profit: 0 };
        map[q].income += m.income || 0;
        map[q].expenses += m.expenses || 0;
        map[q].profit += m.profit || 0;
      }
      return Object.values(map);
    }

    if (selectedPeriod === 'half-yearly') {
      const map: Record<string, { month: string; income: number; expenses: number; profit: number }>
        = { H1: { month: 'H1', income: 0, expenses: 0, profit: 0 }, H2: { month: 'H2', income: 0, expenses: 0, profit: 0 } };
      for (const m of source as any[]) {
        const idx = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].findIndex(mm => mm === m.month);
        const h = idx >= 0 && idx < 6 ? 'H1' : 'H2';
        map[h].income += m.income || 0;
        map[h].expenses += m.expenses || 0;
        map[h].profit += m.profit || 0;
      }
      return Object.values(map);
    }

    // yearly
    const totals = { month: 'Year', income: 0, expenses: 0, profit: 0 } as any;
    for (const m of source as any[]) {
      totals.income += m.income || 0;
      totals.expenses += m.expenses || 0;
      totals.profit += m.profit || 0;
    }
    return [totals];
  }, [filteredMonthly, selectedPeriod]);

  const summaryForBranch = useMemo(() => {
    if (Array.isArray(filteredTransactions) && filteredTransactions.length > 0) {
      const income = filteredTransactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + (t.amount || 0), 0);
      const expenses = filteredTransactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + (t.amount || 0), 0);
      const netProfit = income - expenses;
      
      // Calculate monthly averages
      const monthlyIncome = income / 12;
      const monthlyExpenses = expenses / 12;
      const monthlyProfit = netProfit / 12;
      
      // Find top categories
      const categoryTotals: Record<string, number> = {};
      filteredTransactions.forEach((t: any) => {
        const categoryName = t.category?.name || 'Uncategorized';
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + t.amount;
      });
      
      const topIncomeCategory = Object.entries(categoryTotals)
        .filter(([_, amount]) => amount > 0)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
        
      const topExpenseCategory = Object.entries(categoryTotals)
        .filter(([_, amount]) => amount < 0)
        .sort(([,a], [,b]) => a - b)[0]?.[0] || 'None';
      
      return {
        totalIncome: income,
        totalExpenses: expenses,
        netProfit,
        monthlyIncome,
        monthlyExpenses,
        monthlyProfit,
        topIncomeCategory,
        topExpenseCategory,
      };
    }
    
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlyProfit: 0,
      topIncomeCategory: 'None',
      topExpenseCategory: 'None',
    };
  }, [filteredTransactions]);

  const handleAddTransaction = (data: any) => {
    // In a real app, this would make an API call
    toast({
      title: "Transaction Added",
      description: "The transaction has been successfully recorded.",
    });
    setShowTransactionForm(false);
  };

  const handleViewAllTransactions = () => {
    navigate('/finance/transactions');
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Your financial report is being prepared.",
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
          <p className="text-muted-foreground">Track your gym's financial performance and manage transactions</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Branch selector */}
          <div className="w-[200px]">
            <Select value={selectedBranch} onValueChange={(v) => setSelectedBranch(v as any)}>
              <SelectTrigger className="bg-card border-muted">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {getAccessibleBranches().map((bid) => (
                  <SelectItem key={bid} value={bid}>{bid}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PermissionGate permission="finance.view">
            <Button variant="outline" onClick={handleGenerateReport}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </PermissionGate>
          
          <PermissionGate permission="finance.create">
            <Button onClick={() => setShowTransactionForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions 
        onAddIncome={() => setShowIncomeDialog(true)}
        onAddExpense={() => setShowExpenseDialog(true)}
        onCreateInvoice={() => setShowInvoiceDialog(true)}
        onViewReports={() => navigate('/finance/reports')}
        onManageCategories={() => setShowCategoryDialog(true)}
      />

      {/* Overview Cards */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <FinanceOverviewCards summary={summaryForBranch} />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Charts and Analytics */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Package Analytics */}
            <Card className="lg:col-span-1 border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Package Analytics
                  </CardTitle>
                  <CardDescription>
                    You've earned 79% extra than last year
                  </CardDescription>
                </div>
                <div className="w-[140px]">
                  <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half-yearly">Half Yearly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <MonthlyTrendChart data={chartDataForPeriod as any} />
              </CardContent>
            </Card>

            {/* Cost Analytics */}
            <Card className="lg:col-span-1 border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Cost Analytics
                  </CardTitle>
                  <CardDescription>
                    You've earned 79% extra than last year
                  </CardDescription>
                </div>
                <div className="w-[140px]">
                  <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half-yearly">Half Yearly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <CategoryBreakdownChart transactions={filteredTransactions} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions Preview */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Latest 5 financial activities
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleViewAllTransactions}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <RecentTransactions transactions={filteredTransactions.slice(0, 5)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <TransactionTable
            transactions={filteredTransactions}
            onExport={() => toast({
              title: "Export Started",
              description: "Your transaction export will be ready shortly.",
            })}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(summaryForBranch.totalIncome ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(summaryForBranch.totalExpenses ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(summaryForBranch.netProfit ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Monthly Growth</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.3%</div>
                <p className="text-xs text-muted-foreground">
                  Consistent growth trend
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Charts */}
          <div className="grid gap-6 lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Financial Performance Over Time</CardTitle>
                <CardDescription>
                  Detailed view of income, expenses, and profit trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyTrendChart data={filteredMonthly} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Form */}
      <PermissionGate permission="finance.create">
        <TransactionForm
          open={showTransactionForm}
          onOpenChange={setShowTransactionForm}
          onSubmit={handleAddTransaction}
        />
      </PermissionGate>

      {/* Additional Dialogs */}
      <AddIncomeDialog
        open={showIncomeDialog}
        onOpenChange={setShowIncomeDialog}
        onSubmit={handleAddTransaction}
      />
      
      <AddExpenseDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
        onSubmit={handleAddTransaction}
      />
      
      <InvoiceCreationDialog
        open={showInvoiceDialog}
        onOpenChange={setShowInvoiceDialog}
        onSubmit={(data) => {
          toast({
            title: "Invoice Created",
            description: `Invoice ${data.invoiceNumber} has been created successfully.`,
          });
        }}
      />
      
      <CategoryManagementDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
      />
    </div>
  );
}
