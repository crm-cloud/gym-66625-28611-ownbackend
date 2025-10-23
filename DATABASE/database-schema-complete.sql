-- ============================================================================
-- FITVERSE COMPLETE DATABASE SCHEMA
-- PostgreSQL Database Schema for FitVerse Application
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE app_role AS ENUM ('admin', 'manager', 'trainer', 'member', 'staff');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled', 'suspended', 'pending');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled', 'suspended', 'pending');
CREATE TYPE class_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'waitlisted', 'attended', 'no_show');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE equipment_status AS ENUM ('available', 'in_use', 'maintenance', 'out_of_service');
CREATE TYPE locker_status AS ENUM ('available', 'occupied', 'maintenance', 'reserved');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE notification_type AS ENUM ('system', 'payment', 'membership', 'class', 'announcement');
CREATE TYPE feedback_category AS ENUM ('facility', 'staff', 'equipment', 'class', 'general');
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE photo_type AS ENUM ('front', 'back', 'side', 'other');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Profiles Table (replaces auth.users)
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  date_of_birth DATE,
  gender gender,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_phone ON profiles(phone);

-- User Roles Table (CRITICAL: Separate table for security)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Gyms Table
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#000000',
  secondary_color VARCHAR(7) DEFAULT '#FFFFFF',
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  website TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  tax_id VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'INR',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches Table
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  manager_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  capacity INTEGER,
  opening_time TIME,
  closing_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_branches_gym_id ON branches(gym_id);
CREATE INDEX idx_branches_manager_id ON branches(manager_id);

-- ============================================================================
-- MEMBERSHIP SYSTEM
-- ============================================================================

-- Membership Plans Table
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  admission_fee DECIMAL(10, 2) DEFAULT 0,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_membership_plans_gym_id ON membership_plans(gym_id);

-- Members Table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  membership_id VARCHAR(50) UNIQUE,
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES members(id) ON DELETE SET NULL,
  height DECIMAL(5, 2),
  weight DECIMAL(5, 2),
  blood_group VARCHAR(5),
  medical_conditions TEXT,
  fitness_goals TEXT,
  preferred_workout_time VARCHAR(50),
  status membership_status DEFAULT 'pending',
  joined_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_branch_id ON members(branch_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_referral_code ON members(referral_code);

-- Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_id UUID,
  status subscription_status DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_member_id ON subscriptions(member_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- ============================================================================
-- TRAINER SYSTEM
-- ============================================================================

-- Trainers Table
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  specializations TEXT[],
  experience_years INTEGER,
  certifications TEXT[],
  bio TEXT,
  hourly_rate DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  availability JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trainers_user_id ON trainers(user_id);
CREATE INDEX idx_trainers_branch_id ON trainers(branch_id);
CREATE INDEX idx_trainers_rating ON trainers(rating);

-- Trainer Certifications Table
CREATE TABLE trainer_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  certification_name VARCHAR(255) NOT NULL,
  issuing_organization VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trainer_certifications_trainer_id ON trainer_certifications(trainer_id);

-- Trainer Availability Table
CREATE TABLE trainer_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trainer_id, day_of_week, start_time)
);

CREATE INDEX idx_trainer_availability_trainer_id ON trainer_availability(trainer_id);

-- Training Packages Table
CREATE TABLE training_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE RESTRICT,
  package_name VARCHAR(255) NOT NULL,
  total_sessions INTEGER NOT NULL,
  sessions_completed INTEGER DEFAULT 0,
  sessions_remaining INTEGER,
  price DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status subscription_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_packages_member_id ON training_packages(member_id);
CREATE INDEX idx_training_packages_trainer_id ON training_packages(trainer_id);

-- Trainer Assignments Table
CREATE TABLE trainer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE RESTRICT,
  package_id UUID REFERENCES training_packages(id) ON DELETE SET NULL,
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status class_status DEFAULT 'scheduled',
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trainer_assignments_member_id ON trainer_assignments(member_id);
CREATE INDEX idx_trainer_assignments_trainer_id ON trainer_assignments(trainer_id);
CREATE INDEX idx_trainer_assignments_session_date ON trainer_assignments(session_date);

-- Trainer Reviews Table
CREATE TABLE trainer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trainer_id, member_id)
);

CREATE INDEX idx_trainer_reviews_trainer_id ON trainer_reviews(trainer_id);
CREATE INDEX idx_trainer_reviews_member_id ON trainer_reviews(member_id);

-- Trainer Change Requests Table
CREATE TABLE trainer_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  current_trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  requested_trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trainer_change_requests_member_id ON trainer_change_requests(member_id);

-- ============================================================================
-- CLASSES SYSTEM
-- ============================================================================

-- Classes Table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  class_type VARCHAR(100),
  max_capacity INTEGER NOT NULL,
  current_bookings INTEGER DEFAULT 0,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status class_status DEFAULT 'scheduled',
  recurring BOOLEAN DEFAULT false,
  recurring_pattern VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_branch_id ON classes(branch_id);
CREATE INDEX idx_classes_trainer_id ON classes(trainer_id);
CREATE INDEX idx_classes_scheduled_date ON classes(scheduled_date);
CREATE INDEX idx_classes_status ON classes(status);

-- Class Bookings Table
CREATE TABLE class_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  booking_date TIMESTAMPTZ DEFAULT NOW(),
  status booking_status DEFAULT 'confirmed',
  attended BOOLEAN DEFAULT false,
  payment_id UUID,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, member_id)
);

CREATE INDEX idx_class_bookings_class_id ON class_bookings(class_id);
CREATE INDEX idx_class_bookings_member_id ON class_bookings(member_id);
CREATE INDEX idx_class_bookings_status ON class_bookings(status);

-- ============================================================================
-- ATTENDANCE SYSTEM
-- ============================================================================

-- Attendance Table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL,
  check_out_time TIMESTAMPTZ,
  device_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_branch_id ON attendance(branch_id);
CREATE INDEX idx_attendance_check_in_time ON attendance(check_in_time DESC);

-- Attendance Devices Table
CREATE TABLE attendance_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  device_name VARCHAR(255) NOT NULL,
  device_type VARCHAR(50),
  device_id VARCHAR(100) UNIQUE,
  ip_address VARCHAR(45),
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attendance_devices_branch_id ON attendance_devices(branch_id);

-- ============================================================================
-- PAYMENT SYSTEM
-- ============================================================================

-- Payment Gateways Table
CREATE TABLE payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name VARCHAR(100) NOT NULL,
  gateway_type VARCHAR(50) NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  webhook_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  order_id UUID,
  invoice_id UUID,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  gateway_id UUID REFERENCES payment_gateways(id) ON DELETE SET NULL,
  transaction_id VARCHAR(255),
  status payment_status DEFAULT 'pending',
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Payment Logs Table
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  request_data JSONB,
  response_data JSONB,
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_logs_payment_id ON payment_logs(payment_id);

-- Invoices Table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  status payment_status DEFAULT 'pending',
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  notes TEXT,
  line_items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_member_id ON invoices(member_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================================================
-- PRODUCTS & POS SYSTEM
-- ============================================================================

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  barcode VARCHAR(100),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_branch_id ON products(branch_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status payment_status DEFAULT 'pending',
  order_status order_status DEFAULT 'pending',
  served_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  order_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_member_id ON orders(member_id);
CREATE INDEX idx_orders_branch_id ON orders(branch_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================================
-- EQUIPMENT & FACILITIES
-- ============================================================================

-- Equipment Table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  serial_number VARCHAR(100),
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  warranty_expiry DATE,
  status equipment_status DEFAULT 'available',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  location VARCHAR(255),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_branch_id ON equipment(branch_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_category ON equipment(category);

-- Equipment Maintenance Table
CREATE TABLE equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  maintenance_date DATE NOT NULL,
  maintenance_type VARCHAR(100),
  description TEXT,
  cost DECIMAL(10, 2),
  performed_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  next_maintenance_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_maintenance_equipment_id ON equipment_maintenance(equipment_id);

-- Lockers Table
CREATE TABLE lockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  locker_number VARCHAR(50) NOT NULL,
  location VARCHAR(100),
  status locker_status DEFAULT 'available',
  assigned_to UUID REFERENCES members(id) ON DELETE SET NULL,
  assigned_date DATE,
  monthly_rent DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, locker_number)
);

CREATE INDEX idx_lockers_branch_id ON lockers(branch_id);
CREATE INDEX idx_lockers_status ON lockers(status);
CREATE INDEX idx_lockers_assigned_to ON lockers(assigned_to);

-- ============================================================================
-- LEADS & CRM
-- ============================================================================

-- Leads Table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  source VARCHAR(100),
  status lead_status DEFAULT 'new',
  interested_in TEXT,
  budget_range VARCHAR(50),
  preferred_contact_time VARCHAR(50),
  assigned_to UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  follow_up_date DATE,
  notes TEXT,
  converted_to_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_branch_id ON leads(branch_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_phone ON leads(phone);

-- Lead Activities Table
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  notes TEXT,
  performed_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);

-- ============================================================================
-- REFERRALS SYSTEM
-- ============================================================================

-- Referrals Table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  referred_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  referral_code VARCHAR(20) NOT NULL,
  referred_name VARCHAR(255),
  referred_phone VARCHAR(20),
  referred_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  reward_amount DECIMAL(10, 2),
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);

-- ============================================================================
-- COMMUNICATION SYSTEM
-- ============================================================================

-- Announcements Table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience VARCHAR(50) DEFAULT 'all',
  priority VARCHAR(20) DEFAULT 'normal',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_branch_id ON announcements(branch_id);
CREATE INDEX idx_announcements_published_at ON announcements(published_at DESC);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'system',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Email Logs Table
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  body TEXT,
  template_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- SMS Logs Table
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sms_logs_recipient_phone ON sms_logs(recipient_phone);

-- ============================================================================
-- FEEDBACK SYSTEM
-- ============================================================================

-- Feedback Table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  category feedback_category DEFAULT 'general',
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  response TEXT,
  responded_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_member_id ON feedback(member_id);
CREATE INDEX idx_feedback_branch_id ON feedback(branch_id);
CREATE INDEX idx_feedback_status ON feedback(status);

-- ============================================================================
-- TASKS & WORKFLOW
-- ============================================================================

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  task_type VARCHAR(50),
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_branch_id ON tasks(branch_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Task Comments Table
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);

-- ============================================================================
-- PROGRESS TRACKING
-- ============================================================================

-- Member Progress Photos Table
CREATE TABLE member_progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type photo_type,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_member_progress_photos_member_id ON member_progress_photos(member_id);

-- Body Measurements Table
CREATE TABLE body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  weight DECIMAL(5, 2),
  height DECIMAL(5, 2),
  chest DECIMAL(5, 2),
  waist DECIMAL(5, 2),
  hips DECIMAL(5, 2),
  biceps DECIMAL(5, 2),
  thighs DECIMAL(5, 2),
  body_fat_percentage DECIMAL(5, 2),
  muscle_mass DECIMAL(5, 2),
  bmi DECIMAL(5, 2),
  notes TEXT,
  measured_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  measurement_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_body_measurements_member_id ON body_measurements(member_id);
CREATE INDEX idx_body_measurements_measurement_date ON body_measurements(measurement_date DESC);

-- ============================================================================
-- WORKOUT & DIET PLANS
-- ============================================================================

-- Workout Plans Table
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  plan_name VARCHAR(255) NOT NULL,
  description TEXT,
  goal VARCHAR(255),
  duration_weeks INTEGER,
  start_date DATE,
  end_date DATE,
  exercises JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_plans_member_id ON workout_plans(member_id);
CREATE INDEX idx_workout_plans_trainer_id ON workout_plans(trainer_id);

-- Diet Plans Table
CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  plan_name VARCHAR(255) NOT NULL,
  description TEXT,
  goal VARCHAR(255),
  calorie_target INTEGER,
  protein_target INTEGER,
  carbs_target INTEGER,
  fat_target INTEGER,
  start_date DATE,
  end_date DATE,
  meals JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diet_plans_member_id ON diet_plans(member_id);
CREATE INDEX idx_diet_plans_trainer_id ON diet_plans(trainer_id);

-- ============================================================================
-- GAMIFICATION & ACHIEVEMENTS
-- ============================================================================

-- Achievements Table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  badge_url TEXT,
  criteria JSONB,
  points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements Table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, achievement_id)
);

CREATE INDEX idx_user_achievements_member_id ON user_achievements(member_id);

-- Member Points Table
CREATE TABLE member_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_member_points_member_id ON member_points(member_id);

-- ============================================================================
-- CHALLENGES & CAMPAIGNS
-- ============================================================================

-- Challenges Table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goal JSONB,
  reward TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challenges_branch_id ON challenges(branch_id);

-- Challenge Participants Table
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  progress JSONB,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, member_id)
);

CREATE INDEX idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_member_id ON challenge_participants(member_id);

-- Campaigns Table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(100),
  target_audience VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  discount_percentage DECIMAL(5, 2),
  discount_amount DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_branch_id ON campaigns(branch_id);

-- ============================================================================
-- REPORTS & ANALYTICS
-- ============================================================================

-- Reports Table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  report_name VARCHAR(255) NOT NULL,
  generated_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  report_data JSONB,
  file_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_branch_id ON reports(branch_id);
CREATE INDEX idx_reports_report_type ON reports(report_type);

-- AI Insights Table
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  insight_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_branch_id ON ai_insights(branch_id);

-- ============================================================================
-- AUTHENTICATION TABLES
-- ============================================================================

-- Email Verification Tokens
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_verification UNIQUE (user_id)
);

CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_reset UNIQUE (user_id)
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainers_updated_at BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lockers_updated_at BEFORE UPDATE ON lockers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update trainer rating when review is added
CREATE OR REPLACE FUNCTION update_trainer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trainers
  SET 
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM trainer_reviews WHERE trainer_id = NEW.trainer_id),
    total_reviews = (SELECT COUNT(*) FROM trainer_reviews WHERE trainer_id = NEW.trainer_id)
  WHERE id = NEW.trainer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trainer_rating_trigger
AFTER INSERT OR UPDATE ON trainer_reviews
FOR EACH ROW EXECUTE FUNCTION update_trainer_rating();

-- Update training package sessions
CREATE OR REPLACE FUNCTION update_package_sessions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE training_packages
    SET 
      sessions_completed = sessions_completed + 1,
      sessions_remaining = total_sessions - (sessions_completed + 1)
    WHERE id = NEW.package_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_package_sessions_trigger
AFTER INSERT OR UPDATE ON trainer_assignments
FOR EACH ROW EXECUTE FUNCTION update_package_sessions();

-- ============================================================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'Core user profiles (replaces auth.users)';
COMMENT ON TABLE user_roles IS 'User role assignments - CRITICAL: separate table for security';
COMMENT ON TABLE email_verification_tokens IS 'Stores email verification tokens for new user registration';
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens for account recovery';

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
