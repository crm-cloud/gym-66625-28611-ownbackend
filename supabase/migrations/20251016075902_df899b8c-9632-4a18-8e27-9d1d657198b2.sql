-- Insert demo WhatsApp templates with valid categories
INSERT INTO whatsapp_templates (name, category, event, body_text, variables, is_active) VALUES
  ('Member Welcome', 'welcome', 'member_welcome', 
   'Welcome to {{branch_name}}, {{member_name}}! Your fitness journey starts now. We are excited to have you as part of our community. 💪', 
   '["member_name", "branch_name"]'::jsonb, true),
  ('Membership Expiry Reminder', 'reminders', 'membership_expiring', 
   'Hi {{member_name}}, your membership at {{branch_name}} expires on {{expiry_date}}. Renew now to continue your fitness journey! Contact us for details.', 
   '["member_name", "branch_name", "expiry_date"]'::jsonb, true),
  ('Class Booking Confirmation', 'classes', 'class_booked', 
   'Great! {{member_name}}, you are confirmed for {{class_name}} on {{class_date}} at {{class_time}}. See you there! 🎉', 
   '["member_name", "class_name", "class_date", "class_time"]'::jsonb, true),
  ('Payment Confirmation', 'payments', 'payment_received', 
   'Thank you {{member_name}}! We have received your payment of {{amount}} for {{description}}. Receipt: {{invoice_number}}', 
   '["member_name", "amount", "description", "invoice_number"]'::jsonb, true),
  ('Membership Renewal', 'membership', 'membership_renewed',
   'Congratulations {{member_name}}! Your membership at {{branch_name}} has been renewed successfully. Thank you for continuing your fitness journey with us! 💪',
   '["member_name", "branch_name"]'::jsonb, true),
  ('Appointment Reminder', 'appointments', 'appointment_reminder',
   'Hi {{member_name}}, this is a reminder for your {{appointment_type}} appointment scheduled for {{date}} at {{time}}. See you soon!',
   '["member_name", "appointment_type", "date", "time"]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- Seed demo locker sizes  
INSERT INTO locker_sizes (name, dimensions, monthly_fee) VALUES
  ('Small', '12x12x36 inches', 10.00),
  ('Medium', '12x18x36 inches', 15.00),
  ('Large', '18x18x36 inches', 20.00),
  ('Extra Large', '24x18x36 inches', 25.00)
ON CONFLICT DO NOTHING;