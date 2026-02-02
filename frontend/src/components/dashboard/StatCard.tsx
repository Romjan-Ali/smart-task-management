import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <Badge variant="secondary" className="mt-2">
            <TrendingUp className="mr-1 h-3 w-3" />
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
