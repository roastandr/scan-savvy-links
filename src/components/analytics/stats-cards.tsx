
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer } from "recharts";

type Stat = {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  data?: Array<{ name: string; value: number }>;
  icon?: React.ReactNode;
};

interface StatsCardProps {
  stat: Stat;
}

export function StatsCard({ stat }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          <CardDescription>{stat.description}</CardDescription>
        </div>
        {stat.icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        {stat.change !== undefined && (
          <p className={`text-xs ${stat.change >= 0 ? "text-green-500" : "text-red-500"}`}>
            {stat.change >= 0 ? "+" : ""}{stat.change}% from last period
          </p>
        )}
        {stat.data && (
          <div className="h-10 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stat.data}>
                <Bar 
                  dataKey="value" 
                  fill={stat.change !== undefined && stat.change < 0 
                    ? "hsl(var(--destructive))" 
                    : "hsl(var(--primary))"
                  }
                  radius={[2, 2, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: Stat[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} stat={stat} />
      ))}
    </div>
  );
}
