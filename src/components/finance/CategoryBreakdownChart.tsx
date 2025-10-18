
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction } from '@/types/finance';

interface CategoryBreakdownChartProps {
  transactions: Transaction[];
}

export function CategoryBreakdownChart({ transactions }: CategoryBreakdownChartProps) {
  // Process data to get category breakdown
  const categoryData = transactions.reduce((acc, transaction) => {
    const categoryName = transaction.category.name;
    const existingCategory = acc.find(item => item.name === categoryName);
    
    if (existingCategory) {
      existingCategory.value += transaction.amount;
    } else {
      acc.push({
        name: categoryName,
        value: transaction.amount,
        color: transaction.category.color,
        type: transaction.type,
      });
    }
    
    return acc;
  }, [] as any[]);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry: any) => (
            <span style={{ color: entry.color }}>
              {value} ({entry.payload.type})
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
