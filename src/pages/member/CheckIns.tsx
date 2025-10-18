
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  UserCheck, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin,
  TrendingUp,
  Target,
  Star,
  QrCode
} from 'lucide-react';
import { useState } from 'react';

export default function CheckIns() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const recentCheckIns = [
    {
      id: '1',
      date: '2024-01-19',
      time: '06:30 AM',
      duration: '1h 45m',
      type: 'Gym Session',
      location: 'Downtown Branch',
      activities: ['Cardio', 'Weight Training']
    },
    {
      id: '2',
      date: '2024-01-18',
      time: '06:00 PM',
      duration: '1h 00m',
      type: 'Yoga Class',
      location: 'Downtown Branch',
      activities: ['Yoga Flow']
    },
    {
      id: '3',
      date: '2024-01-17',
      time: '07:00 AM',
      duration: '2h 15m',
      type: 'Personal Training',
      location: 'Downtown Branch',
      activities: ['Strength Training', 'Flexibility']
    },
    {
      id: '4',
      date: '2024-01-16',
      time: '05:45 AM',
      duration: '1h 30m',
      type: 'Gym Session',
      location: 'Downtown Branch',
      activities: ['Cardio', 'Core Workout']
    },
    {
      id: '5',
      date: '2024-01-15',
      time: '06:30 PM',
      duration: '45m',
      type: 'HIIT Class',
      location: 'Downtown Branch',
      activities: ['HIIT Training']
    }
  ];

  const monthlyStats = {
    totalVisits: 15,
    averageDuration: '1h 25m',
    longestStreak: 5,
    currentStreak: 3,
    favoriteTime: 'Morning (6-9 AM)',
    totalHours: 21.5
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Check-ins</h1>
          <p className="text-muted-foreground">Track your gym visits and workout history</p>
        </div>
        <Button>
          <QrCode className="w-4 h-4 mr-2" />
          Quick Check-in
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{monthlyStats.totalVisits}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-2xl font-bold text-foreground">{monthlyStats.currentStreak}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Duration</CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="text-2xl font-bold text-foreground">{monthlyStats.averageDuration}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Per visit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold text-foreground">{monthlyStats.totalHours}h</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
              <CardDescription>Your latest gym visits and activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{checkIn.type}</h3>
                        <Badge variant="outline">{checkIn.duration}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(checkIn.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {checkIn.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {checkIn.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {checkIn.activities.map((activity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Insights</CardTitle>
              <CardDescription>Your workout patterns and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Favorite Workout Time</p>
                  <p className="text-sm text-muted-foreground">{monthlyStats.favoriteTime}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Longest Streak</p>
                  <p className="text-sm text-muted-foreground">{monthlyStats.longestStreak} consecutive days</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Most Active Day</p>
                  <p className="text-sm text-muted-foreground">Monday (4 visits)</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Average Weekly Visits</p>
                  <p className="text-sm text-muted-foreground">3.8 times per week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout Calendar</CardTitle>
              <CardDescription>View your workout history</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Workout day</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span>Class attended</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span>Personal training</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Monthly Goal
              </CardTitle>
              <CardDescription>Track your visit target</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{monthlyStats.totalVisits}/20</div>
                <p className="text-sm text-muted-foreground">Visits this month</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round((monthlyStats.totalVisits / 20) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((monthlyStats.totalVisits / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                {20 - monthlyStats.totalVisits} visits remaining to reach your goal
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
