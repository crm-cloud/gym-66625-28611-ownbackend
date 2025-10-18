import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  referralId: string;
  type: 'signup' | 'membership' | 'bonus_earned';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { referralId, type }: NotificationRequest = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch referral details
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select(`
        *,
        referrer:profiles!referrer_id(full_name, email),
        referred:profiles!referred_id(full_name, email)
      `)
      .eq('id', referralId)
      .single();

    if (referralError || !referral) {
      throw new Error('Referral not found');
    }

    // Get referral settings for bonus amounts
    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .like('key', 'referral_%');

    const settingsMap = settings?.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>) || {};

    let emailHtml = '';
    let subject = '';

    switch (type) {
      case 'signup':
        subject = '🎉 Your Referral Just Signed Up!';
        emailHtml = `
          <h1>Great News!</h1>
          <p>Hi ${referral.referrer?.full_name || 'there'},</p>
          <p><strong>${referral.referred_email}</strong> just signed up using your referral code!</p>
          <p>You've earned <strong>$${referral.signup_bonus_amount}</strong> in signup bonus credits.</p>
          <p>When they purchase a membership, you'll earn an additional <strong>$${settingsMap.referral_membership_bonus || '100'}</strong>!</p>
          <hr />
          <p>Keep sharing your referral code: <strong>${referral.referral_code}</strong></p>
          <p style="color: #666; font-size: 12px;">This is an automated notification from your gym management system.</p>
        `;
        break;

      case 'membership':
        subject = '💰 Membership Bonus Earned!';
        emailHtml = `
          <h1>Membership Bonus!</h1>
          <p>Hi ${referral.referrer?.full_name || 'there'},</p>
          <p>Your referral <strong>${referral.referred?.full_name || referral.referred_email}</strong> just purchased a membership!</p>
          <p>You've earned <strong>$${referral.membership_bonus_amount}</strong> in membership bonus credits.</p>
          <p>Your total bonus from this referral: <strong>$${referral.signup_bonus_amount + referral.membership_bonus_amount}</strong></p>
          <hr />
          <p>Keep up the great work!</p>
          <p style="color: #666; font-size: 12px;">This is an automated notification from your gym management system.</p>
        `;
        break;

      case 'bonus_earned':
        const totalBonus = referral.signup_bonus_amount + referral.membership_bonus_amount;
        subject = '🏆 Referral Bonus Summary';
        emailHtml = `
          <h1>Referral Bonus Earned!</h1>
          <p>Hi ${referral.referrer?.full_name || 'there'},</p>
          <p>Your referral has been successfully completed!</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Bonus Breakdown</h3>
            <p><strong>Signup Bonus:</strong> $${referral.signup_bonus_amount}</p>
            <p><strong>Membership Bonus:</strong> $${referral.membership_bonus_amount}</p>
            <hr />
            <p><strong>Total Earned:</strong> $${totalBonus}</p>
          </div>
          <p>These credits have been added to your account and can be used for membership renewals, personal training sessions, or retail purchases.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">This is an automated notification from your gym management system.</p>
        `;
        break;
    }

    // Send email to referrer
    if (referral.referrer?.email) {
      const { error: emailError } = await resend.emails.send({
        from: 'Gym Management <notifications@resend.dev>',
        to: [referral.referrer.email],
        subject,
        html: emailHtml,
      });

      if (emailError) {
        console.error('Email send error:', emailError);
      }
    }

    // Create in-app notification
    await supabase.from('announcements').insert({
      title: subject,
      content: emailHtml.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
      target_roles: ['member'],
      created_by: null,
      priority: type === 'membership' ? 2 : 1,
      notification_type: 'system',
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
