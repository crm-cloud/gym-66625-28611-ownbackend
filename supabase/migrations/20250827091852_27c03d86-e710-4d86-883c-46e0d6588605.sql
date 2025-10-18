-- Create enum types first
CREATE TYPE equipment_status AS ENUM ('operational', 'maintenance', 'out_of_order', 'retired');
CREATE TYPE equipment_condition AS ENUM ('excellent', 'good', 'fair', 'poor');
CREATE TYPE maintenance_type AS ENUM ('routine', 'repair', 'deep_cleaning', 'calibration');
CREATE TYPE maintenance_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE plan_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE plan_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'intern');
CREATE TYPE session_type AS ENUM ('personal_training', 'group_class', 'consultation', 'assessment');
CREATE TYPE assignment_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE package_status AS ENUM ('active', 'paused', 'expired', 'cancelled');
CREATE TYPE email_template_type AS ENUM ('welcome', 'membership_renewal', 'payment_reminder', 'class_reminder', 'birthday', 'promotional', 'system_notification');
CREATE TYPE sms_template_type AS ENUM ('welcome', 'appointment_reminder', 'payment_due', 'class_cancelled', 'promotional', 'otp_verification');