export interface PredefinedTemplate {
  id: string;
  name: string;
  category: string;
  subject?: string;
  content: string;
  variables: string[];
  description: string;
}

export const predefinedEmailTemplates: PredefinedTemplate[] = [
  {
    id: 'welcome_member',
    name: 'Member Welcome Email',
    category: 'membership',
    subject: 'Welcome to {{gym_name}} - Let\'s Get Started! 💪',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center;">
        <h1 style="margin: 0 0 20px 0; font-size: 28px;">Welcome to {{gym_name}}!</h1>
        <p style="font-size: 18px; margin-bottom: 30px;">We're excited to have you join our fitness family, {{member_name}}!</p>
      </div>
      
      <div style="padding: 40px 20px; background: white;">
        <h2 style="color: #333; margin-bottom: 20px;">Your Membership Details</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <p><strong>Plan:</strong> {{membership_plan}}</p>
          <p><strong>Start Date:</strong> {{start_date}}</p>
          <p><strong>Member ID:</strong> {{member_id}}</p>
        </div>
        
        <h3 style="color: #667eea;">What's Next?</h3>
        <ul style="text-align: left; color: #555;">
          <li>Download our mobile app</li>
          <li>Book your first training session</li>
          <li>Join our community challenges</li>
          <li>Meet your assigned trainer: {{trainer_name}}</li>
        </ul>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="{{app_link}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
        </div>
      </div>
    `,
    variables: ['gym_name', 'member_name', 'membership_plan', 'start_date', 'member_id', 'trainer_name', 'app_link'],
    description: 'Beautiful welcome email for new members with membership details and next steps'
  },
  {
    id: 'payment_reminder',
    name: 'Payment Reminder',
    category: 'payment',
    subject: 'Payment Reminder - {{gym_name}}',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 30px;">
        <h2 style="color: #856404; margin-top: 0;">Payment Reminder</h2>
        
        <p>Dear {{member_name}},</p>
        
        <p>This is a friendly reminder that your membership payment is due soon.</p>
        
        <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details</h3>
          <p><strong>Amount Due:</strong> {{amount}}</p>
          <p><strong>Due Date:</strong> {{due_date}}</p>
          <p><strong>Membership Plan:</strong> {{membership_plan}}</p>
        </div>
        
        <p>You can make your payment through:</p>
        <ul>
          <li>Our mobile app</li>
          <li>Front desk at {{gym_name}}</li>
          <li>Online payment portal</li>
        </ul>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="{{payment_link}}" style="background: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px;">Pay Now</a>
        </div>
      </div>
    `,
    variables: ['member_name', 'amount', 'due_date', 'membership_plan', 'gym_name', 'payment_link'],
    description: 'Professional payment reminder with clear payment details and options'
  },
  {
    id: 'class_booking_confirmation',
    name: 'Class Booking Confirmation',
    category: 'classes',
    subject: 'Class Booked Successfully - {{class_name}}',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(45deg, #ff6b6b, #ee5a24); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Class Booked! 🎉</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">You're all set for {{class_name}}</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <h2 style="margin-top: 0; color: #333;">Class Details</h2>
          <p><strong>📅 Date:</strong> {{class_date}}</p>
          <p><strong>🕐 Time:</strong> {{class_time}}</p>
          <p><strong>👨‍🏫 Instructor:</strong> {{instructor_name}}</p>
          <p><strong>📍 Location:</strong> {{location}}</p>
          <p><strong>👥 Spots Available:</strong> {{available_spots}}</p>
        </div>
        
        <h3 style="color: #ff6b6b;">What to Bring</h3>
        <ul style="color: #555;">
          <li>Water bottle</li>
          <li>Towel</li>
          <li>Comfortable workout clothes</li>
          <li>Positive attitude! 💪</li>
        </ul>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          Need to cancel? Please do so at least 2 hours before class time.
        </p>
      </div>
    `,
    variables: ['class_name', 'class_date', 'class_time', 'instructor_name', 'location', 'available_spots'],
    description: 'Exciting class booking confirmation with all essential details'
  }
];

export const predefinedSMSTemplates: PredefinedTemplate[] = [
  {
    id: 'welcome_sms',
    name: 'Welcome SMS',
    category: 'membership',
    content: 'Welcome to {{gym_name}}, {{member_name}}! 💪 Your membership is active. Member ID: {{member_id}}. Ready to start your fitness journey? Download our app: {{app_link}}',
    variables: ['gym_name', 'member_name', 'member_id', 'app_link'],
    description: 'Quick welcome message with essential info'
  },
  {
    id: 'payment_due_sms',
    name: 'Payment Due Reminder',
    category: 'payment',
    content: 'Hi {{member_name}}, your membership payment of {{amount}} is due on {{due_date}}. Pay now to avoid interruption: {{payment_link}} - {{gym_name}}',
    variables: ['member_name', 'amount', 'due_date', 'payment_link', 'gym_name'],
    description: 'Concise payment reminder with direct action'
  },
  {
    id: 'class_reminder_sms',
    name: 'Class Reminder',
    category: 'classes',
    content: 'Reminder: {{class_name}} with {{instructor_name}} starts in 1 hour at {{location}}. See you there! 🏃‍♂️ - {{gym_name}}',
    variables: ['class_name', 'instructor_name', 'location', 'gym_name'],
    description: '1-hour class reminder to reduce no-shows'
  },
  {
    id: 'membership_expiry_sms',
    name: 'Membership Expiry Alert',
    category: 'membership',
    content: '⚠️ {{member_name}}, your membership expires on {{expiry_date}}. Renew now to continue enjoying {{gym_name}}: {{renewal_link}}',
    variables: ['member_name', 'expiry_date', 'gym_name', 'renewal_link'],
    description: 'Urgent membership expiry notification'
  }
];

export const predefinedWhatsAppTemplates: PredefinedTemplate[] = [
  {
    id: 'welcome_whatsapp',
    name: 'Welcome Message',
    category: 'membership',
    content: `🎉 *Welcome to {{gym_name}}, {{member_name}}!*

We're thrilled to have you join our fitness family! 💪

*Your Membership Details:*
📋 Plan: {{membership_plan}}
📅 Start Date: {{start_date}}
🆔 Member ID: {{member_id}}

*What's Next?*
✅ Download our app
✅ Book your first session
✅ Meet your trainer: {{trainer_name}}

Ready to transform your fitness journey? Let's do this! 🔥`,
    variables: ['gym_name', 'member_name', 'membership_plan', 'start_date', 'member_id', 'trainer_name'],
    description: 'Engaging welcome message with emojis and clear structure'
  },
  {
    id: 'workout_motivation_whatsapp',
    name: 'Daily Motivation',
    category: 'engagement',
    content: `🌟 *Good morning, {{member_name}}!*

Today is a perfect day to crush your fitness goals! 💪

*Your Progress This Week:*
🏃‍♂️ Workouts: {{weekly_workouts}}
🔥 Calories burned: {{calories_burned}}
⏱️ Total time: {{total_time}}

*Today's Tip:* {{daily_tip}}

Keep pushing, you've got this! 🚀

_{{gym_name}} Team_`,
    variables: ['member_name', 'weekly_workouts', 'calories_burned', 'total_time', 'daily_tip', 'gym_name'],
    description: 'Motivational daily message with progress tracking'
  },
  {
    id: 'birthday_whatsapp',
    name: 'Birthday Wishes',
    category: 'engagement',
    content: `🎂 *Happy Birthday {{member_name}}!* 🎉

Wishing you a fantastic year ahead filled with strength, health, and happiness! 

🎁 *Birthday Gift:*
We've added a complimentary personal training session to your account! Book it anytime this month.

*Special Birthday Workout Challenge:*
Complete {{age}} reps of your favorite exercise today! 💪

Celebrate strong! 🎊

_With love from the {{gym_name}} family_ ❤️`,
    variables: ['member_name', 'age', 'gym_name'],
    description: 'Personal birthday message with special offers'
  },
  {
    id: 'invoice_whatsapp',
    name: 'Invoice Notification',
    category: 'payment',
    content: `📄 *Invoice Generated - {{gym_name}}*

Hi {{member_name}}, 

Your invoice has been generated successfully! 

*Invoice Details:*
🧾 Invoice #: {{invoice_number}}
💰 Amount: {{amount}}
📅 Due Date: {{due_date}}
📋 Description: {{description}}

📱 View & Pay: {{invoice_link}}

Thank you for choosing {{gym_name}}! 🙏`,
    variables: ['gym_name', 'member_name', 'invoice_number', 'amount', 'due_date', 'description', 'invoice_link'],
    description: 'Professional invoice notification with payment link'
  }
];

export const getAllPredefinedTemplates = () => ({
  email: predefinedEmailTemplates,
  sms: predefinedSMSTemplates,
  whatsapp: predefinedWhatsAppTemplates
});