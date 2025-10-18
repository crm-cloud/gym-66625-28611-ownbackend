import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { MembershipFormData, MembershipPlan } from '@/types/membership';
import { useBranches } from '@/hooks/useBranches';
import { useMembershipPlans } from '@/hooks/useSupabaseQuery';

const membershipFormSchema = z.object({
  planId: z.string().min(1, 'Please select a membership plan'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  gstEnabled: z.boolean().default(false),
  promoCode: z.string().optional(),
  gstRate: z.number().min(0).max(100).optional(),
  reverseGst: z.boolean().default(false).optional(),
  totalInclGst: z.number().min(0).optional(),
});

interface AssignMembershipDrawerProps {
  open: boolean;
  onClose: () => void;
  memberName: string;
  onSubmit: (data: MembershipFormData) => void;
}

export const AssignMembershipDrawer = ({ 
  open, 
  onClose, 
  memberName, 
  onSubmit 
}: AssignMembershipDrawerProps) => {
  const { selectedBranch } = useBranches();
  const { data: membershipPlans } = useMembershipPlans();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  const form = useForm<z.infer<typeof membershipFormSchema>>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      gstEnabled: false,
      discountPercent: 0,
      discountAmount: 0,
      promoCode: '',
      gstRate: 18,
      reverseGst: false,
      totalInclGst: undefined,
    }
  });

  const filteredPlans = (membershipPlans || []).filter((p: any) => !selectedBranch || !p.branch_id || p.branch_id === selectedBranch.id);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Assign Membership</SheetTitle>
          <SheetDescription>
            Assign a plan to {memberName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                onSubmit({
                  planId: values.planId,
                  startDate: values.startDate,
                  discountPercent: values.discountPercent,
                  discountAmount: values.discountAmount,
                  gstEnabled: values.gstEnabled,
                  promoCode: values.promoCode?.trim() || undefined,
                  gstRate: values.gstRate,
                  reverseGst: values.reverseGst,
                  totalInclGst: values.totalInclGst,
                });
              })}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Plan & Start</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="planId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membership Plan *</FormLabel>
                        <Select onValueChange={(val) => {
                          field.onChange(val);
                          const plan = filteredPlans.find((p: any) => p.id === val) as MembershipPlan | undefined;
                          setSelectedPlan(plan || null);
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredPlans.map((plan: any) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} — ₹{plan.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="promoCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promo / Referral Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter referral code (optional)" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="discountPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount %</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Amount</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gstEnabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST</FormLabel>
                          <div className="flex items-center h-10">
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gstRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="18" {...field} value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reverseGst"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reverse GST</FormLabel>
                          <div className="flex items-center h-10">
                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch('gstEnabled') && form.watch('reverseGst') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="totalInclGst"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Incl. GST</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Final total" {...field} value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Summary */}
                  <div className="mt-2 p-3 bg-muted rounded-md text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Plan Price</span>
                      <span>₹{selectedPlan?.price ?? 0}</span>
                    </div>
                    {form.watch('promoCode') && (
                      <div className="flex justify-between text-green-600">
                        <span>Referral Discount (10%)</span>
                        <span>-₹{selectedPlan ? Math.round((selectedPlan.price * 10) / 100) : 0}</span>
                      </div>
                    )}
                    {typeof form.watch('discountPercent') === 'number' && form.watch('discountPercent')! > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Extra Discount ({form.watch('discountPercent')}%)</span>
                        <span>-₹{selectedPlan ? Math.round((selectedPlan.price * (form.watch('discountPercent') || 0)) / 100) : 0}</span>
                      </div>
                    )}
                    {typeof form.watch('discountAmount') === 'number' && form.watch('discountAmount')! > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount Amount</span>
                        <span>-₹{form.watch('discountAmount')}</span>
                      </div>
                    )}
                    {/* GST calculation */}
                    {form.watch('gstEnabled') && (
                      <>
                        <div className="flex justify-between">
                          <span>GST Amount</span>
                          <span>
                            ₹{(() => {
                              const price = selectedPlan?.price || 0;
                              const referralDisc = form.watch('promoCode') ? Math.round(price * 0.1) : 0;
                              const pct = Math.round(price * ((form.watch('discountPercent') || 0) / 100));
                              const flat = form.watch('discountAmount') || 0;
                              const base = Math.max(0, price - referralDisc - pct - flat);
                              const rate = (form.watch('gstRate') || 0) / 100;
                              if (form.watch('reverseGst') && form.watch('totalInclGst')) {
                                const incl = form.watch('totalInclGst') || 0;
                                const baseFromIncl = Math.round(incl / (1 + rate));
                                return Math.max(0, incl - baseFromIncl);
                              } else {
                                return Math.round(base * rate);
                              }
                            })()}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-medium pt-1 border-t mt-1">
                      <span>Total</span>
                      <span>
                        ₹{(() => {
                          const price = selectedPlan?.price || 0;
                          const referralDisc = form.watch('promoCode') ? Math.round(price * 0.1) : 0;
                          const pct = Math.round(price * ((form.watch('discountPercent') || 0) / 100));
                          const flat = form.watch('discountAmount') || 0;
                          const base = Math.max(0, price - referralDisc - pct - flat);
                          if (form.watch('gstEnabled')) {
                            const rate = (form.watch('gstRate') || 0) / 100;
                            if (form.watch('reverseGst') && form.watch('totalInclGst')) {
                              return form.watch('totalInclGst') || 0;
                            } else {
                              const gst = Math.round(base * rate);
                              return base + gst;
                            }
                          }
                          return base;
                        })()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <SheetFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">
                  <CreditCard className="w-4 h-4 mr-2" /> Assign
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};