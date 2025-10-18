
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Target, Calendar } from 'lucide-react';

export const PlanStatsOverview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Plan Performance Overview
        </CardTitle>
        <CardDescription>Key metrics and insights from your plans</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-green-600">92%</div>
            <p className="text-sm text-muted-foreground">Average Completion Rate</p>
            <div className="text-xs text-green-600">+5% from last month</div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-blue-600">4.6</div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <div className="text-xs text-blue-600">★★★★★</div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-purple-600">78%</div>
            <p className="text-sm text-muted-foreground">Member Satisfaction</p>
            <div className="text-xs text-purple-600">Excellent feedback</div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-orange-600">15</div>
            <p className="text-sm text-muted-foreground">Days Avg. Duration</p>
            <div className="text-xs text-orange-600">Optimal length</div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>45 active members following plans</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span>85% achieving their goals</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>12 new plans created this month</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
