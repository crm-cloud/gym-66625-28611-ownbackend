import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Utensils, Dumbbell, Calendar, User, TrendingUp } from 'lucide-react';

export const MemberDietWorkoutPage = () => {
  const { data: member, isLoading: memberLoading } = useMemberProfile();
  
  const { data: dietPlans = [], isLoading: dietLoading } = useSupabaseQuery(
    ['member-diet-plans', member?.user_id],
    async () => {
      if (!member?.user_id) return [];
      
      // Get member-specific plans
      const { data: memberPlans, error: memberError } = await supabase
        .from('member_diet_plans')
        .select('*, diet_plans(*)')
        .eq('user_id', member.user_id)
        .eq('is_active', true);
      
      if (memberError) throw memberError;
      
      // Get global template plans if no member-specific plans
      if (!memberPlans || memberPlans.length === 0) {
        const { data: globalPlans, error: globalError } = await supabase
          .from('diet_plans')
          .select('*')
          .eq('is_template', true)
          .eq('status', 'active')
          .eq('branch_id', member.branch_id);
        
        if (globalError) throw globalError;
        return globalPlans || [];
      }
      
      return memberPlans.map(mp => mp.diet_plans);
    },
    { enabled: !!member?.user_id }
  );

  const { data: workoutPlans = [], isLoading: workoutLoading } = useSupabaseQuery(
    ['member-workout-plans', member?.user_id],
    async () => {
      if (!member?.user_id) return [];
      
      // Get member-specific plans
      const { data: memberPlans, error: memberError } = await supabase
        .from('member_workout_plans')
        .select('*, workout_plans(*)')
        .eq('user_id', member.user_id)
        .eq('is_active', true);
      
      if (memberError) throw memberError;
      
      // Get global template plans if no member-specific plans
      if (!memberPlans || memberPlans.length === 0) {
        const { data: globalPlans, error: globalError } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('is_template', true)
          .eq('status', 'active')
          .eq('branch_id', member.branch_id);
        
        if (globalError) throw globalError;
        return globalPlans || [];
      }
      
      return memberPlans.map(mp => mp.workout_plans);
    },
    { enabled: !!member?.user_id }
  );

  if (memberLoading || dietLoading || workoutLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your plans...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Profile Setup Required</h1>
        <p className="text-muted-foreground">Your member profile is being set up.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Diet & Workout Plans</h1>
        <p className="text-muted-foreground">Follow your personalized fitness plans</p>
      </div>

      <Tabs defaultValue="diet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diet" className="flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            Diet Plans
          </TabsTrigger>
          <TabsTrigger value="workout" className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Workout Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diet" className="space-y-4">
          {dietPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dietPlans.map((plan: any) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Utensils className="w-5 h-5" />
                          {plan.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {plan.description}
                        </CardDescription>
                      </div>
                      <Badge variant={plan.is_template ? "outline" : "default"}>
                        {plan.is_template ? 'Global' : 'Personal'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Difficulty:</span>
                        <Badge variant="outline">{plan.difficulty}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{plan.duration_weeks} weeks</span>
                      </div>
                    </div>
                    
                    {plan.calorie_target && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Daily Target: {plan.calorie_target} calories</p>
                      </div>
                    )}
                    
                    {plan.macros && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="font-medium">{plan.macros.protein}g</p>
                          <p className="text-muted-foreground">Protein</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="font-medium">{plan.macros.carbs}g</p>
                          <p className="text-muted-foreground">Carbs</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="font-medium">{plan.macros.fats}g</p>
                          <p className="text-muted-foreground">Fats</p>
                        </div>
                      </div>
                    )}

                    {plan.target_goals && plan.target_goals.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {plan.target_goals.map((goal: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Utensils className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Diet Plans Yet</h3>
                <p className="text-muted-foreground text-center">
                  Your trainer will assign you a personalized diet plan soon.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workout" className="space-y-4">
          {workoutPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workoutPlans.map((plan: any) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Dumbbell className="w-5 h-5" />
                          {plan.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {plan.description}
                        </CardDescription>
                      </div>
                      <Badge variant={plan.is_template ? "outline" : "default"}>
                        {plan.is_template ? 'Global' : 'Personal'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Level:</span>
                        <Badge variant="outline">{plan.difficulty}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{plan.duration_weeks} weeks</span>
                      </div>
                    </div>

                    {plan.equipment_needed && plan.equipment_needed.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Equipment Needed:</p>
                        <div className="flex flex-wrap gap-1">
                          {plan.equipment_needed.map((eq: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {eq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {plan.target_goals && plan.target_goals.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Goals:</p>
                        <div className="flex flex-wrap gap-1">
                          {plan.target_goals.map((goal: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Workout Plans Yet</h3>
                <p className="text-muted-foreground text-center">
                  Your trainer will assign you a personalized workout plan soon.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};