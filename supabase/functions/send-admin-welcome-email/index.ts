import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminWelcomeRequest {
  adminId: string;
  adminEmail: string;
  adminName: string;
  gymName: string;
  temporaryPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adminId, adminEmail, adminName, gymName, temporaryPassword }: AdminWelcomeRequest = await req.json();

    console.log("Sending welcome email to admin:", { adminEmail, adminName, gymName });

    // Get app URL for login link
    const appUrl = req.headers.get("origin") || "https://gfrpkapmievifpqfhjrp.supabase.co";

    const emailResponse = await resend.emails.send({
      from: "GymFlow Admin <admin@gymflow.com>",
      to: [adminEmail],
      subject: `Welcome to GymFlow - Your Admin Account is Ready!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to GymFlow Admin</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Welcome to GymFlow!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your gym management platform</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${adminName}! 👋</h2>
            
            <p>Congratulations! Your admin account for <strong>${gymName}</strong> has been successfully created. You now have full access to manage your gym's operations through GymFlow.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #495057;">Your Login Credentials</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${adminEmail}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${temporaryPassword}</code></p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #6c757d;">⚠️ Please change your password after your first login for security.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Login to GymFlow Dashboard
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <h3 style="color: #333;">What you can do as an Admin:</h3>
              <ul style="color: #555; padding-left: 20px;">
                <li>Manage branch locations and settings</li>
                <li>Add and oversee trainers and staff</li>
                <li>Monitor member registrations and payments</li>
                <li>View detailed analytics and reports</li>
                <li>Configure gym equipment and maintenance</li>
                <li>Handle member feedback and support</li>
              </ul>
            </div>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #1565c0;"><strong>Need Help?</strong> Check out our admin guide or contact our support team. We're here to help you succeed!</p>
            </div>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Best regards,<br>
              The GymFlow Team
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This email was sent to ${adminEmail}. If you didn't expect this email, please contact our support team.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    // Log the email event in system events
    await supabase.from('system_events').insert({
      event_type: 'info',
      event_category: 'user_activity',
      title: 'Admin Welcome Email Sent',
      description: `Welcome email sent to new admin: ${adminName} (${adminEmail}) for gym: ${gymName}`,
      metadata: {
        admin_id: adminId,
        admin_email: adminEmail,
        admin_name: adminName,
        gym_name: gymName,
        email_id: emailResponse.data?.id
      },
      severity: 1
    });

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-welcome-email function:", error);
    
    // Log the error event
    try {
      await supabase.from('system_events').insert({
        event_type: 'error',
        event_category: 'system',
        title: 'Admin Welcome Email Failed',
        description: `Failed to send welcome email: ${error.message}`,
        metadata: { error: error.message },
        severity: 4
      });
    } catch (logError) {
      console.error("Failed to log error event:", logError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);