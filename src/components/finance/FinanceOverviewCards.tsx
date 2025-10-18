
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { FinancialSummary } from '@/types/finance';
import { useCurrency } from '@/hooks/useCurrency';

interface FinanceOverviewCardsProps {
  summary: FinancialSummary;
  dueAmount?: number;
  duePaymentsCount?: number; // number of members with dues or total due payments
}

export function FinanceOverviewCards({ summary }: FinanceOverviewCardsProps) {
  const { formatCurrency } = useCurrency();

  const safe = (n: number | undefined | null) => Number.isFinite(Number(n)) ? Number(n) : 0;

  const baseCards = [
    {
      title: 'Total Income',
      value: formatCurrency(safe(summary.totalIncome)),
      monthlyValue: formatCurrency(safe((summary as any).monthlyIncome)),
      icon: TrendingUp,
      trend: 'up',
      trendValue: '+12.5%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(safe(summary.totalExpenses)),
      monthlyValue: formatCurrency(safe((summary as any).monthlyExpenses)),
      icon: TrendingDown,
      trend: 'down',
      trendValue: '-8.2%',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(safe(summary.netProfit)),
      monthlyValue: formatCurrency(safe((summary as any).monthlyProfit)),
      icon: DollarSign,
      trend: 'up',
      trendValue: '+15.3%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Monthly Profit',
      value: formatCurrency(safe((summary as any).monthlyProfit)),
      monthlyValue: 'This month',
      icon: Wallet,
      trend: 'up',
      trendValue: '+5.7%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  // Optional extras to match reference UI
  const extras = [
    {
      title: 'Due Amount',
      value: formatCurrency(safe((summary as any).dueAmount)),
      monthlyValue: 'Outstanding',
      icon: DollarSign,
      trend: 'down',
      trendValue: '—',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Due Payments',
      value: `${safe((summary as any).duePaymentsCount)} / Person`,
      monthlyValue: 'This period',
      icon: Wallet,
      trend: 'up',
      trendValue: '—',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  const cards = [...baseCards, ...extras];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {card.monthlyValue}
              </p>
              <Badge 
                variant={card.trend === 'up' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {card.trend === 'up' ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {card.trendValue}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
