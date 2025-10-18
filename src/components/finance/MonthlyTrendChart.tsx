
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import { MonthlyData } from '@/types/finance';

interface MonthlyTrendChartProps {
  data: MonthlyData[];
}

const chartConfig = {
  income: {
    label: "Income",
    color: "#10B981",
  },
  expenses: {
    label: "Expenses", 
    color: "#EF4444",
  },
  profit: {
    label: "Profit",
    color: "#3B82F6",
  },
};

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="var(--color-income)" 
          strokeWidth={2}
          dot={{ fill: "var(--color-income)" }}
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="var(--color-expenses)" 
          strokeWidth={2}
          dot={{ fill: "var(--color-expenses)" }}
        />
        <Line 
          type="monotone" 
          dataKey="profit" 
          stroke="var(--color-profit)" 
          strokeWidth={2}
          dot={{ fill: "var(--color-profit)" }}
        />
      </LineChart>
    </ChartContainer>
  );
}
