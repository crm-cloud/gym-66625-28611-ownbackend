-- CreateEnum
CREATE TYPE "public"."assignment_status" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "public"."attendance_status" AS ENUM ('checked-in', 'checked-out', 'no-show', 'late');

-- CreateEnum
CREATE TYPE "public"."bonus_type" AS ENUM ('referral_signup', 'referral_membership', 'loyalty_points');

-- CreateEnum
CREATE TYPE "public"."device_status" AS ENUM ('online', 'offline', 'maintenance');

-- CreateEnum
CREATE TYPE "public"."class_difficulty" AS ENUM ('beginner', 'intermediate', 'advanced', 'all_levels');

-- CreateEnum
CREATE TYPE "public"."discount_type" AS ENUM ('percentage', 'fixed_amount');

-- CreateEnum
CREATE TYPE "public"."email_template_type" AS ENUM ('welcome', 'payment_reminder', 'class_booking', 'promotion', 'password_reset', 'custom');

-- CreateEnum
CREATE TYPE "public"."equipment_status" AS ENUM ('operational', 'maintenance', 'out_of_order');

-- CreateEnum
CREATE TYPE "public"."feedback_category" AS ENUM ('general', 'class', 'trainer', 'facility', 'billing');

-- CreateEnum
CREATE TYPE "public"."feedback_status" AS ENUM ('new', 'in_review', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "public"."class_recurrence" AS ENUM ('none', 'daily', 'weekly', 'bi_weekly', 'monthly');

-- CreateEnum
CREATE TYPE "public"."invoice_status" AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."lead_priority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "public"."lead_status" AS ENUM ('new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'lost');

-- CreateEnum
CREATE TYPE "public"."locker_status" AS ENUM ('available', 'occupied', 'maintenance');

-- CreateEnum
CREATE TYPE "public"."membership_status" AS ENUM ('active', 'inactive', 'frozen', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."freeze_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."plan_duration_unit" AS ENUM ('days', 'weeks', 'months', 'years');

-- CreateEnum
CREATE TYPE "public"."order_status" AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "public"."payment_gateway_provider" AS ENUM ('stripe', 'razorpay', 'paypal', 'manual', 'payu', 'phonepe', 'ccavenue');

-- CreateEnum
CREATE TYPE "public"."payment_transaction_status" AS ENUM ('pending', 'success', 'failed', 'refunded', 'processing', 'completed', 'cancelled', 'paid');

-- CreateEnum
CREATE TYPE "public"."permission_category" AS ENUM ('member_management', 'finance', 'scheduling', 'reporting', 'settings', 'staff');

-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('member', 'trainer', 'staff', 'manager', 'admin', 'super_admin');

-- CreateEnum
CREATE TYPE "public"."plan_status" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "public"."referral_bonus_type" AS ENUM ('credit', 'discount', 'free_month');

-- CreateEnum
CREATE TYPE "public"."role_scope" AS ENUM ('global', 'branch', 'gym');

-- CreateEnum
CREATE TYPE "public"."sms_template_type" AS ENUM ('reminder', 'notification', 'promotion', 'otp');

-- CreateEnum
CREATE TYPE "public"."backup_type" AS ENUM ('full', 'incremental', 'schema');

-- CreateEnum
CREATE TYPE "public"."backup_status" AS ENUM ('pending', 'in_progress', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "public"."event_category" AS ENUM ('system', 'user', 'billing', 'security');

-- CreateEnum
CREATE TYPE "public"."event_type" AS ENUM ('login', 'update', 'create', 'delete', 'payment');

-- CreateEnum
CREATE TYPE "public"."severity_level" AS ENUM ('info', 'warning', 'error', 'critical');

-- CreateEnum
CREATE TYPE "public"."team_member_status" AS ENUM ('active', 'inactive', 'on_leave');

-- CreateEnum
CREATE TYPE "public"."session_type" AS ENUM ('personal_training', 'group_class', 'consultation', 'single', 'package');

-- CreateEnum
CREATE TYPE "public"."certification_level" AS ENUM ('basic', 'intermediate', 'advanced', 'expert');

-- CreateEnum
CREATE TYPE "public"."trainer_change_reason" AS ENUM ('scheduling_conflict', 'personality_mismatch', 'specialty_change', 'performance_issue', 'other');

-- CreateEnum
CREATE TYPE "public"."trainer_change_status" AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- CreateEnum
CREATE TYPE "public"."trainer_change_urgency" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "public"."package_status" AS ENUM ('active', 'expired', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "public"."trainer_status" AS ENUM ('active', 'inactive', 'on_leave', 'busy');

-- CreateEnum
CREATE TYPE "public"."utilization_period" AS ENUM ('daily', 'weekly', 'monthly');

-- CreateEnum
CREATE TYPE "public"."transaction_kind" AS ENUM ('income', 'expense', 'package_purchase', 'single_session', 'refund');

-- CreateEnum
CREATE TYPE "public"."notification_type" AS ENUM ('system', 'message', 'reminder', 'achievement', 'payment_success', 'payment_failed', 'payment_reminder', 'receipt_ready');

-- CreateEnum
CREATE TYPE "public"."whatsapp_template_category" AS ENUM ('marketing', 'utility', 'authentication');

-- CreateEnum
CREATE TYPE "public"."whatsapp_template_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."whatsapp_template_type" AS ENUM ('text', 'media', 'interactive');

-- CreateEnum
CREATE TYPE "public"."payment_gateway_type" AS ENUM ('razorpay', 'payu', 'phonepe', 'ccavenue');

-- CreateEnum
CREATE TYPE "public"."payment_gateway_environment" AS ENUM ('sandbox', 'live');

-- CreateEnum
CREATE TYPE "public"."payment_type" AS ENUM ('membership', 'pos', 'invoice', 'training_fee');

-- CreateEnum
CREATE TYPE "public"."payment_method" AS ENUM ('card', 'upi', 'netbanking', 'wallet', 'cash', 'bank_transfer');

-- CreateEnum
CREATE TYPE "public"."payment_log_type" AS ENUM ('webhook', 'api_call', 'callback', 'error');

-- CreateEnum
CREATE TYPE "public"."payment_processing_status" AS ENUM ('received', 'processed', 'failed');

-- CreateEnum
CREATE TYPE "public"."email_log_type" AS ENUM ('payment_success', 'payment_failed', 'payment_link', 'invoice');

-- CreateEnum
CREATE TYPE "public"."delivery_status" AS ENUM ('queued', 'sent', 'delivered', 'failed', 'bounced');

-- CreateEnum
CREATE TYPE "public"."sms_log_type" AS ENUM ('payment_success', 'payment_failed', 'payment_link', 'reminder');

-- CreateEnum
CREATE TYPE "public"."trainer_assignment_assigned_by" AS ENUM ('auto', 'manual', 'member_request');

-- CreateEnum
CREATE TYPE "public"."member_trainer_preferences_gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "public"."member_trainer_preferences_experience_level" AS ENUM ('any', 'beginner_friendly', 'experienced', 'expert');

-- CreateTable
CREATE TABLE "public"."achievements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon_url" TEXT,
    "criteria" JSONB NOT NULL,
    "points_value" INTEGER DEFAULT 0,
    "rarity" TEXT DEFAULT 'common',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_insights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "branch_id" UUID,
    "insight_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence_score" DECIMAL,
    "data_sources" TEXT[],
    "recommendation_data" JSONB,
    "is_applied" BOOLEAN DEFAULT false,
    "applied_at" TIMESTAMPTZ,
    "effectiveness_score" DECIMAL,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" TEXT,
    "user_id" UUID,
    "branch_id" UUID,
    "event_category" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "properties" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."announcements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_by" UUID,
    "branch_ids" UUID[],
    "target_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publish_date" TIMESTAMPTZ NOT NULL,
    "expiry_date" TIMESTAMPTZ,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "check_in_time" TIMESTAMPTZ NOT NULL,
    "check_out_time" TIMESTAMPTZ,
    "duration_minutes" INTEGER,
    "status" "public"."attendance_status" DEFAULT 'checked-in',
    "attendance_type" TEXT DEFAULT 'gym_access',
    "class_id" UUID,
    "notes" TEXT,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biometric_devices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "ip_address" TEXT,
    "serial_number" TEXT,
    "status" "public"."device_status" DEFAULT 'offline',
    "last_sync" TIMESTAMPTZ,
    "installed_at" DATE,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biometric_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."branch_analytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "total_members" INTEGER DEFAULT 0,
    "active_members" INTEGER DEFAULT 0,
    "new_signups" INTEGER DEFAULT 0,
    "check_ins" INTEGER DEFAULT 0,
    "revenue" DECIMAL(12,2) DEFAULT 0.00,
    "expenses" DECIMAL(12,2) DEFAULT 0.00,
    "class_attendance" INTEGER DEFAULT 0,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branch_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."branches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "operating_hours" JSONB,
    "is_active" BOOLEAN DEFAULT true,
    "timezone" VARCHAR(50) DEFAULT 'UTC',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "gym_id" UUID,
    "manager_id" UUID,
    "max_capacity" INTEGER DEFAULT 100,
    "current_occupancy" INTEGER DEFAULT 0,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "class_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "enrollment_date" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT DEFAULT 'enrolled',
    "attended_at" TIMESTAMPTZ,

    CONSTRAINT "class_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."credit_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "related_order_id" UUID,
    "related_bonus_id" UUID,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dashboard_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "metric_name" TEXT NOT NULL,
    "metric_value" DECIMAL NOT NULL,
    "metric_unit" TEXT,
    "period" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dashboard_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."diet_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by" UUID,
    "branch_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "plan_details" JSONB,
    "status" "public"."plan_status" DEFAULT 'active',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diet_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."discount_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "code" TEXT NOT NULL,
    "discount_type" "public"."discount_type" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "max_uses" INTEGER,
    "uses_count" INTEGER DEFAULT 0,
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "is_active" BOOLEAN DEFAULT true,
    "applicable_to" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "type" "public"."email_template_type" NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "variables" JSONB,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "purchase_date" DATE,
    "warranty_expiry_date" DATE,
    "status" "public"."equipment_status" DEFAULT 'operational',
    "last_maintenance_date" DATE,
    "next_maintenance_date" DATE,
    "location" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment_analytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "equipment_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "usage_hours" DECIMAL(6,2) DEFAULT 0.00,
    "downtime_hours" DECIMAL(6,2) DEFAULT 0.00,
    "maintenance_cost" DECIMAL(10,2) DEFAULT 0.00,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "category" "public"."feedback_category" NOT NULL,
    "rating" INTEGER,
    "comments" TEXT,
    "submitted_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."feedback_status" DEFAULT 'new',
    "resolved_at" TIMESTAMPTZ,
    "tags" TEXT[],

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feedback_responses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "feedback_id" UUID NOT NULL,
    "responded_by" UUID NOT NULL,
    "response_text" TEXT NOT NULL,
    "responded_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gym_classes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "trainer_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "public"."class_difficulty" NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "capacity" INTEGER,
    "enrolled_count" INTEGER DEFAULT 0,
    "status" TEXT DEFAULT 'scheduled',
    "recurrence" "public"."class_recurrence" DEFAULT 'none',
    "recurrence_end_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gym_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gym_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "total_checkins" INTEGER DEFAULT 0,
    "peak_usage_hours" TEXT[],
    "average_duration_minutes" DECIMAL(6,2) DEFAULT 0.00,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gym_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gyms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "owner_id" UUID,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "subscription_plan_id" UUID,
    "status" TEXT DEFAULT 'active',

    CONSTRAINT "gyms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoice_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "issue_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "due_date" DATE,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2) DEFAULT 0.00,
    "status" "public"."invoice_status" DEFAULT 'draft',
    "related_membership_id" UUID,
    "related_order_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lead_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lead_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_id" UUID NOT NULL,
    "assigned_to" UUID NOT NULL,
    "task_description" TEXT NOT NULL,
    "due_date" TIMESTAMPTZ,
    "is_completed" BOOLEAN DEFAULT false,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT,
    "assigned_to" UUID,
    "status" "public"."lead_status" DEFAULT 'new',
    "priority" "public"."lead_priority" DEFAULT 'medium',
    "last_contacted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "estimated_value" DECIMAL(10,2),
    "notes" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locker_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "locker_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ,
    "status" TEXT DEFAULT 'active',

    CONSTRAINT "locker_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locker_sizes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "dimensions" TEXT,
    "price" DECIMAL(8,2) DEFAULT 0.00,

    CONSTRAINT "locker_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lockers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "size_id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "location" TEXT,
    "status" "public"."locker_status" DEFAULT 'available',
    "assigned_member_id" UUID,
    "notes" TEXT,

    CONSTRAINT "lockers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."maintenance_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "equipment_id" UUID NOT NULL,
    "maintenance_date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(10,2) DEFAULT 0.00,
    "performed_by" TEXT,
    "technician_id" UUID,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_achievements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "achievement_id" UUID NOT NULL,
    "unlocked_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_analytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "total_checkins" INTEGER DEFAULT 0,
    "classes_attended" INTEGER DEFAULT 0,
    "avg_session_duration_minutes" DECIMAL(6,2) DEFAULT 0.00,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_credits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "balance" INTEGER DEFAULT 0,
    "last_updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_diet_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "diet_plan_id" UUID NOT NULL,
    "assigned_by" UUID,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "notes" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_diet_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_discount_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "discount_code_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "used_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_discount_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "goal_type" TEXT NOT NULL,
    "target_value" DECIMAL,
    "target_unit" TEXT,
    "start_date" DATE DEFAULT CURRENT_DATE,
    "target_date" DATE,
    "status" TEXT DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_measurements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "measurement_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "weight_kg" DECIMAL(6,2),
    "height_cm" DECIMAL(5,1),
    "body_fat_percentage" DECIMAL(4,1),
    "muscle_mass_kg" DECIMAL(5,2),
    "chest_cm" DECIMAL(5,1),
    "waist_cm" DECIMAL(5,1),
    "hips_cm" DECIMAL(5,1),
    "notes" TEXT,
    "measured_by" UUID,

    CONSTRAINT "member_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "public"."membership_status" DEFAULT 'active',
    "auto_renew" BOOLEAN DEFAULT false,
    "payment_status" "public"."payment_transaction_status" DEFAULT 'pending',
    "last_payment_date" DATE,
    "next_billing_date" DATE,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_workout_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "workout_plan_id" UUID NOT NULL,
    "assigned_by" UUID,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "notes" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_workout_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "member_id_string" TEXT,
    "join_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "date_of_birth" DATE,
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "membership_status" "public"."membership_status" DEFAULT 'active',
    "last_check_in" TIMESTAMPTZ,
    "profile_picture_url" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "medical_conditions" TEXT,
    "fitness_goals" TEXT,
    "preferred_trainer_id" UUID,
    "government_id_type" TEXT,
    "government_id_number" TEXT,
    "is_verified" BOOLEAN DEFAULT false,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."membership_freeze_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_membership_id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "request_date" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT,
    "status" "public"."freeze_status" DEFAULT 'pending',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "reviewer_notes" TEXT,

    CONSTRAINT "membership_freeze_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."membership_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "duration_unit" "public"."plan_duration_unit" NOT NULL,
    "features" TEXT[],
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "email_promotions" BOOLEAN DEFAULT true,
    "email_reminders" BOOLEAN DEFAULT true,
    "sms_notifications" BOOLEAN DEFAULT false,
    "push_notifications" BOOLEAN DEFAULT true,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "order_number" TEXT NOT NULL DEFAULT ('ORD'::text || nextval('orders_order_number_seq'::regclass)),
    "order_date" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" "public"."order_status" DEFAULT 'pending',
    "payment_method" TEXT,
    "payment_status" "public"."payment_transaction_status" DEFAULT 'pending',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_gateway_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_id" UUID NOT NULL,
    "branch_id" UUID,
    "provider" "public"."payment_gateway_provider" NOT NULL,
    "config_details" JSONB NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "environment" TEXT DEFAULT 'sandbox',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "payment_gateway_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_gateway_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_id" UUID NOT NULL,
    "branch_id" UUID,
    "customer_id" UUID,
    "order_id" UUID,
    "invoice_id" UUID,
    "provider" "public"."payment_gateway_provider" NOT NULL,
    "gateway_transaction_id" TEXT,
    "gateway_order_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT DEFAULT 'INR',
    "status" "public"."payment_transaction_status" NOT NULL,
    "payment_method" TEXT,
    "gateway_response" JSONB,
    "failure_reason" TEXT,
    "transaction_time" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "gateway_config_id" UUID,

    CONSTRAINT "payment_gateway_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_methods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "is_online" BOOLEAN DEFAULT false,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" VARCHAR(50) NOT NULL,
    "txn_id" VARCHAR(100) NOT NULL,
    "order_id" VARCHAR(100),
    "payment_reference" VARCHAR(100),
    "member_id" VARCHAR(50),
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'INR',
    "payment_type" "public"."payment_type" NOT NULL,
    "gateway_type" "public"."payment_gateway_type" NOT NULL,
    "payment_method" "public"."payment_method" NOT NULL,
    "status" "public"."payment_transaction_status" DEFAULT 'pending',
    "invoice_id" VARCHAR(50),
    "membership_id" VARCHAR(50),
    "pos_order_id" VARCHAR(50),
    "training_package_id" VARCHAR(50),
    "gateway_response" JSONB,
    "failure_reason" TEXT,
    "initiated_by" VARCHAR(50),
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."permission_category" NOT NULL,
    "module" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "sku" TEXT,
    "stock_quantity" INTEGER DEFAULT 0,
    "category" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "user_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "phone" TEXT,
    "role" "public"."user_role" NOT NULL DEFAULT 'member',
    "team_role" TEXT,
    "branch_id" UUID,
    "gym_id" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."progress_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "entry_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "related_goal_id" UUID,
    "entry_type" TEXT NOT NULL,
    "value" TEXT,
    "unit" TEXT,
    "notes" TEXT,
    "recorded_by" UUID,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."progress_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "photo_url" TEXT NOT NULL,
    "upload_date" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "related_entry_id" UUID,

    CONSTRAINT "progress_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_analytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "referrals_sent" INTEGER DEFAULT 0,
    "successful_referrals" INTEGER DEFAULT 0,
    "bonuses_earned" DECIMAL(10,2) DEFAULT 0.00,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_bonus_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referrer_user_id" UUID NOT NULL,
    "referee_user_id" UUID,
    "referral_id" UUID,
    "bonus_type" "public"."referral_bonus_type" NOT NULL,
    "bonus_value" TEXT NOT NULL,
    "awarded_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "related_transaction_id" UUID,

    CONSTRAINT "referral_bonus_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_bonuses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referral_setting_id" UUID NOT NULL,
    "trigger_event" TEXT NOT NULL,
    "bonus_type" "public"."referral_bonus_type" NOT NULL,
    "bonus_value" TEXT NOT NULL,
    "applies_to_referrer" BOOLEAN DEFAULT true,
    "applies_to_referee" BOOLEAN DEFAULT false,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "referral_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "is_enabled" BOOLEAN DEFAULT true,
    "referral_code_type" TEXT DEFAULT 'unique_user',
    "default_bonus_id" UUID,
    "terms_and_conditions" TEXT,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referrals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referrer_user_id" UUID NOT NULL,
    "referee_email" TEXT,
    "referee_phone" TEXT,
    "referral_code_used" TEXT,
    "status" TEXT DEFAULT 'pending',
    "referee_user_id" UUID,
    "conversion_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "public"."role_scope" NOT NULL DEFAULT 'branch',

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sms_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "type" "public"."sms_template_type" NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "sms_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "price_monthly" DECIMAL(10,2) NOT NULL,
    "price_yearly" DECIMAL(10,2),
    "features" JSONB,
    "max_branches" INTEGER,
    "max_members" INTEGER,
    "max_staff" INTEGER,
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_backups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "backup_time" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "backup_type" "public"."backup_type" NOT NULL,
    "status" "public"."backup_status" NOT NULL,
    "file_path" TEXT,
    "file_size_mb" DECIMAL(10,2),
    "duration_seconds" INTEGER,
    "initiated_by" TEXT,
    "notes" TEXT,

    CONSTRAINT "system_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_time" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "event_category" "public"."event_category" NOT NULL,
    "event_type" "public"."event_type" NOT NULL,
    "severity" "public"."severity_level" DEFAULT 'info',
    "description" TEXT NOT NULL,
    "details" JSONB,
    "user_id" UUID,
    "ip_address" TEXT,

    CONSTRAINT "system_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "description" TEXT,
    "category" TEXT,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "employee_id" TEXT,
    "hire_date" DATE NOT NULL,
    "job_title" TEXT,
    "department" TEXT,
    "manager_id" UUID,
    "status" "public"."team_member_status" DEFAULT 'active',
    "performance_rating" INTEGER,
    "skills" TEXT[],
    "certifications" TEXT[],
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trainer_analytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trainer_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "sessions_conducted" INTEGER DEFAULT 0,
    "avg_session_rating" DECIMAL(3,2),
    "client_retention_rate" DECIMAL(5,2),
    "total_earnings" DECIMAL(12,2) DEFAULT 0.00,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trainer_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trainer_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "session_type" "public"."session_type" NOT NULL,
    "package_id" UUID,
    "scheduled_date" TIMESTAMPTZ NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" "public"."assignment_status" NOT NULL DEFAULT 'scheduled',
    "member_rating" INTEGER,
    "member_feedback" TEXT,
    "trainer_notes" TEXT,
    "created_by" UUID,
    "session_specialty" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "completed_at" TIMESTAMPTZ,
    "is_paid" BOOLEAN DEFAULT false,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMPTZ,
    "payment_method" VARCHAR(50),
    "assigned_by" "public"."trainer_assignment_assigned_by" NOT NULL DEFAULT 'manual',
    "assignment_reason" TEXT,
    "alternative_trainers" TEXT[],
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "trainer_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trainer_availability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trainer_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "is_available" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "trainer_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trainer_certifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trainer_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "issuing_organization" VARCHAR(255) NOT NULL,
    "issue_date" DATE NOT NULL,
    "expiry_date" DATE,
    "credential_id" TEXT,
    "level" "public"."certification_level" NOT NULL,
    "verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trainer_change_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "current_trainer_id" UUID,
    "requested_trainer_id" UUID,
    "reason" "public"."trainer_change_reason" NOT NULL,
    "description" TEXT NOT NULL,
    "urgency" "public"."trainer_change_urgency" NOT NULL DEFAULT 'medium',
    "status" "public"."trainer_change_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "review_notes" TEXT,
    "new_trainer_id" UUID,
    "reassignment_date" TIMESTAMPTZ,
    "member_notified" BOOLEAN DEFAULT false,
    "trainer_notified" BOOLEAN DEFAULT false,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "trainer_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trainer_package_rates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trainer_id" UUID,
    "branch_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "validity_days" INTEGER NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_package_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trainer_packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "package_rate_id" UUID NOT NULL,
    "trainer_id" UUID,
    "purchase_date" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMPTZ NOT NULL,
    "sessions_total" INTEGER NOT NULL,
    "sessions_used" INTEGER DEFAULT 0,
    "status" "public"."package_status" DEFAULT 'active',
    "payment_status" "public"."payment_transaction_status" DEFAULT 'pending',
    "total_amount" DECIMAL(10,2) NOT NULL,
    "payment_id" VARCHAR(255),
    "related_invoice_id" UUID,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "trainer_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trainer_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "employee_id" VARCHAR(50),
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2) DEFAULT 0.00,
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "status" "public"."trainer_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "branch_name" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "avatar_url" TEXT,
    "date_of_birth" DATE,
    "join_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "languages" TEXT[] DEFAULT ARRAY['English']::TEXT[],
    "max_clients_per_day" INTEGER NOT NULL DEFAULT 8,
    "max_clients_per_week" INTEGER NOT NULL DEFAULT 40,
    "total_sessions" INTEGER DEFAULT 0,
    "total_clients" INTEGER DEFAULT 0,
    "completion_rate" INTEGER DEFAULT 100,
    "punctuality_score" INTEGER DEFAULT 100,
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "trainer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trainer_utilization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trainer_id" UUID NOT NULL,
    "period" "public"."utilization_period" NOT NULL,
    "date" DATE NOT NULL,
    "total_available_hours" DECIMAL(5,2) NOT NULL,
    "booked_hours" DECIMAL(5,2) NOT NULL,
    "scheduled_sessions" INTEGER DEFAULT 0,
    "completed_sessions" INTEGER DEFAULT 0,
    "cancelled_sessions" INTEGER DEFAULT 0,
    "no_show_sessions" INTEGER DEFAULT 0,
    "total_revenue" DECIMAL(10,2) DEFAULT 0.00,
    "average_session_value" DECIMAL(10,2) DEFAULT 0.00,
    "average_rating" DECIMAL(3,2) DEFAULT 0.00,
    "punctuality_score" INTEGER DEFAULT 100,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_utilization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "name" TEXT NOT NULL,
    "type" "public"."transaction_kind" NOT NULL,
    "description" TEXT,

    CONSTRAINT "transaction_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "category_id" UUID,
    "member_id" UUID,
    "transaction_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "public"."transaction_kind" NOT NULL,
    "description" TEXT,
    "payment_method_id" UUID,
    "reference_id" TEXT,
    "status" "public"."payment_transaction_status" DEFAULT 'completed',
    "recorded_by" UUID,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" VARCHAR(500),
    "is_read" BOOLEAN DEFAULT false,
    "read_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "branch_id" UUID,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsapp_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "name" TEXT NOT NULL,
    "category" "public"."whatsapp_template_category" NOT NULL,
    "event" TEXT NOT NULL,
    "template_type" "public"."whatsapp_template_type" NOT NULL DEFAULT 'text',
    "header_type" TEXT,
    "header_content" TEXT,
    "body_text" TEXT NOT NULL,
    "footer_text" TEXT,
    "buttons" JSONB DEFAULT '[]',
    "variables" JSONB DEFAULT '[]',
    "status" "public"."whatsapp_template_status" DEFAULT 'pending',
    "provider_template_id" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_by" UUID,

    CONSTRAINT "whatsapp_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_shifts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "name" TEXT NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "days" TEXT[],
    "user_ids" UUID[],
    "minimum_hours" DECIMAL DEFAULT 8,
    "maximum_hours" DECIMAL DEFAULT 12,
    "grace_period" INTEGER DEFAULT 15,
    "late_threshold" INTEGER DEFAULT 30,
    "break_duration" INTEGER DEFAULT 60,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "work_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workout_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by" UUID,
    "branch_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "public"."class_difficulty" NOT NULL,
    "goal" TEXT,
    "plan_details" JSONB,
    "status" "public"."plan_status" DEFAULT 'active',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_gateways" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "public"."payment_gateway_type" NOT NULL,
    "is_active" BOOLEAN DEFAULT false,
    "environment" "public"."payment_gateway_environment" DEFAULT 'sandbox',
    "api_key" VARCHAR(500),
    "api_secret" VARCHAR(500),
    "merchant_id" VARCHAR(200),
    "webhook_secret" VARCHAR(500),
    "additional_config" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "payment_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_logs" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" VARCHAR(50),
    "gateway_type" "public"."payment_gateway_type" NOT NULL,
    "log_type" "public"."payment_log_type" NOT NULL,
    "request_payload" JSONB,
    "response_payload" JSONB,
    "headers" JSONB,
    "status_code" INTEGER,
    "processing_status" "public"."payment_processing_status" DEFAULT 'received',
    "error_message" TEXT,
    "received_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(6),

    CONSTRAINT "payment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_links" (
    "id" VARCHAR(50) NOT NULL,
    "payment_id" VARCHAR(50) NOT NULL,
    "link_token" VARCHAR(100) NOT NULL,
    "member_id" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_type" "public"."payment_type" NOT NULL,
    "description" TEXT,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "is_used" BOOLEAN DEFAULT false,
    "used_at" TIMESTAMP(6),
    "created_by" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_logs" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" VARCHAR(50),
    "member_id" VARCHAR(50),
    "email_type" "public"."email_log_type" NOT NULL,
    "recipient_email" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500),
    "email_body" TEXT,
    "template_used" VARCHAR(100),
    "delivery_status" "public"."delivery_status" DEFAULT 'queued',
    "provider_response" JSONB,
    "sent_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(6),

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sms_logs" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" VARCHAR(50),
    "member_id" VARCHAR(50),
    "sms_type" "public"."sms_log_type" NOT NULL,
    "recipient_phone" VARCHAR(20) NOT NULL,
    "message_content" TEXT NOT NULL,
    "template_used" VARCHAR(100),
    "delivery_status" "public"."delivery_status" DEFAULT 'queued',
    "provider" VARCHAR(50),
    "provider_response" JSONB,
    "sent_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(6),

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_logs" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" VARCHAR(50),
    "member_id" VARCHAR(50) NOT NULL,
    "notification_type" "public"."notification_type" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" VARCHAR(500),
    "is_read" BOOLEAN DEFAULT false,
    "read_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "branch_id" UUID,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_receipts" (
    "id" VARCHAR(50) NOT NULL,
    "payment_id" VARCHAR(50) NOT NULL,
    "receipt_number" VARCHAR(100) NOT NULL,
    "member_id" VARCHAR(50) NOT NULL,
    "invoice_data" JSONB NOT NULL,
    "pdf_path" VARCHAR(500),
    "generated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "generated_by" VARCHAR(50),

    CONSTRAINT "payment_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_analytics" (
    "id" BIGSERIAL NOT NULL,
    "date" DATE NOT NULL,
    "gateway_type" "public"."payment_gateway_type" NOT NULL,
    "payment_type" "public"."payment_type" NOT NULL,
    "total_transactions" INTEGER DEFAULT 0,
    "successful_transactions" INTEGER DEFAULT 0,
    "failed_transactions" INTEGER DEFAULT 0,
    "total_amount" DECIMAL(12,2) DEFAULT 0.00,
    "successful_amount" DECIMAL(12,2) DEFAULT 0.00,
    "average_transaction_value" DECIMAL(10,2) DEFAULT 0.00,
    "success_rate" DECIMAL(5,2) DEFAULT 0.00,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."change_request_workflow" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "status_from" VARCHAR(20),
    "status_to" VARCHAR(20) NOT NULL,
    "changed_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "change_request_workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_trainer_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "preferred_specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferred_gender" "public"."member_trainer_preferences_gender",
    "preferred_experience_level" "public"."member_trainer_preferences_experience_level" DEFAULT 'any',
    "preferred_languages" TEXT[] DEFAULT ARRAY['English']::TEXT[],
    "avoid_trainer_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "max_hourly_rate" DECIMAL(10,2),
    "preferred_time_slots" JSONB,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "member_trainer_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auto_assignment_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "priority_factors" TEXT[] DEFAULT ARRAY['specialty_match', 'availability', 'rating', 'experience', 'price']::TEXT[],
    "require_specialty_match" BOOLEAN DEFAULT true,
    "require_availability" BOOLEAN DEFAULT true,
    "max_price_threshold" DECIMAL(10,2),
    "min_rating_threshold" DECIMAL(3,2) DEFAULT 3.0,
    "min_experience_threshold" INTEGER DEFAULT 1,
    "enable_load_balancing" BOOLEAN DEFAULT true,
    "max_utilization_threshold" INTEGER DEFAULT 80,
    "allow_manual_assignment" BOOLEAN DEFAULT true,
    "notify_on_no_match" BOOLEAN DEFAULT true,
    "waitlist_on_no_match" BOOLEAN DEFAULT false,
    "assignment_window_hours" INTEGER DEFAULT 24,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "auto_assignment_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trainer_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trainer_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "assignment_id" UUID,
    "rating" INTEGER NOT NULL,
    "review_text" TEXT,
    "professionalism_rating" INTEGER,
    "knowledge_rating" INTEGER,
    "communication_rating" INTEGER,
    "is_verified" BOOLEAN DEFAULT false,
    "is_featured" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "trainer_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "trainer_id" UUID,
    "package_id" UUID,
    "assignment_id" UUID,
    "transaction_type" "public"."transaction_kind" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) DEFAULT 'USD',
    "payment_processor" VARCHAR(20) DEFAULT 'stripe',
    "payment_method" VARCHAR(20),
    "processor_transaction_id" VARCHAR(255),
    "processor_fee" DECIMAL(10,2) DEFAULT 0.00,
    "status" "public"."payment_transaction_status" DEFAULT 'pending',
    "payment_metadata" JSONB,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_branchesTogyms" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_branchesTogyms_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "biometric_devices_serial_number_key" ON "public"."biometric_devices"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "branch_analytics_branch_id_key" ON "public"."branch_analytics"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "branch_analytics_branch_id_date_key" ON "public"."branch_analytics"("branch_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "class_enrollments_class_id_member_id_key" ON "public"."class_enrollments"("class_id", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_metrics_branch_id_metric_name_period_date_key" ON "public"."dashboard_metrics"("branch_id", "metric_name", "period", "date");

-- CreateIndex
CREATE UNIQUE INDEX "discount_codes_code_key" ON "public"."discount_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_branch_id_type_name_key" ON "public"."email_templates"("branch_id", "type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_serial_number_key" ON "public"."equipment"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_analytics_equipment_id_date_key" ON "public"."equipment_analytics"("equipment_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "gym_usage_gym_id_month_year_key" ON "public"."gym_usage"("gym_id", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "public"."invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "locker_sizes_name_key" ON "public"."locker_sizes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lockers_branch_id_number_key" ON "public"."lockers"("branch_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "member_achievements_user_id_achievement_id_key" ON "public"."member_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE INDEX "idx_analytics_user_period" ON "public"."member_analytics"("user_id", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "member_analytics_user_id_month_year_key" ON "public"."member_analytics"("user_id", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "member_credits_user_id_key" ON "public"."member_credits"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_diet_plans_user_id_diet_plan_id_start_date_key" ON "public"."member_diet_plans"("user_id", "diet_plan_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "member_discount_usage_user_id_discount_code_id_invoice_id_key" ON "public"."member_discount_usage"("user_id", "discount_code_id", "invoice_id");

-- CreateIndex
CREATE INDEX "member_memberships_user_id_idx" ON "public"."member_memberships"("user_id");

-- CreateIndex
CREATE INDEX "member_memberships_plan_id_idx" ON "public"."member_memberships"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_workout_plans_user_id_workout_plan_id_start_date_key" ON "public"."member_workout_plans"("user_id", "workout_plan_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "members_user_id_key" ON "public"."members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_member_id_string_key" ON "public"."members"("member_id_string");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "public"."notification_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "public"."orders"("order_number");

-- CreateIndex
CREATE INDEX "idx_payment_gateway_configs_branch_id" ON "public"."payment_gateway_configs"("branch_id");

-- CreateIndex
CREATE INDEX "idx_payment_gateway_configs_provider" ON "public"."payment_gateway_configs"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_configs_gym_id_branch_id_provider_environme_key" ON "public"."payment_gateway_configs"("gym_id", "branch_id", "provider", "environment");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_transactions_gateway_transaction_id_key" ON "public"."payment_gateway_transactions"("gateway_transaction_id");

-- CreateIndex
CREATE INDEX "idx_payment_gateway_transactions_customer_id" ON "public"."payment_gateway_transactions"("customer_id");

-- CreateIndex
CREATE INDEX "idx_payment_gateway_transactions_gateway_order_id" ON "public"."payment_gateway_transactions"("gateway_order_id");

-- CreateIndex
CREATE INDEX "idx_payment_gateway_transactions_order_id" ON "public"."payment_gateway_transactions"("order_id");

-- CreateIndex
CREATE INDEX "idx_payment_gateway_transactions_status" ON "public"."payment_gateway_transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_transactions_gateway_order_id_provider_key" ON "public"."payment_gateway_transactions"("gateway_order_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_name_key" ON "public"."payment_methods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payments_txn_id_key" ON "public"."payments"("txn_id");

-- CreateIndex
CREATE INDEX "idx_member_payments" ON "public"."payments"("member_id");

-- CreateIndex
CREATE INDEX "idx_payment_status" ON "public"."payments"("status");

-- CreateIndex
CREATE INDEX "idx_payment_type" ON "public"."payments"("payment_type");

-- CreateIndex
CREATE INDEX "idx_txn_id" ON "public"."payments"("txn_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "public"."permissions"("name");

-- CreateIndex
CREATE INDEX "idx_permissions_category" ON "public"."permissions"("category");

-- CreateIndex
CREATE INDEX "idx_permissions_module" ON "public"."permissions"("module");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "public"."products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "public"."profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "public"."profiles"("email");

-- CreateIndex
CREATE INDEX "progress_entries_user_id_entry_date_idx" ON "public"."progress_entries"("user_id", "entry_date");

-- CreateIndex
CREATE INDEX "progress_entries_related_goal_id_idx" ON "public"."progress_entries"("related_goal_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_analytics_user_id_period_start_period_end_key" ON "public"."referral_analytics"("user_id", "period_start", "period_end");

-- CreateIndex
CREATE INDEX "idx_bonus_history_referral" ON "public"."referral_bonus_history"("referral_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_settings_branch_id_key" ON "public"."referral_settings"("branch_id");

-- CreateIndex
CREATE INDEX "referrals_referrer_user_id_idx" ON "public"."referrals"("referrer_user_id");

-- CreateIndex
CREATE INDEX "referrals_referee_user_id_idx" ON "public"."referrals"("referee_user_id");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "public"."referrals"("status");

-- CreateIndex
CREATE INDEX "referrals_created_at_idx" ON "public"."referrals"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referrer_user_id_referee_email_key" ON "public"."referrals"("referrer_user_id", "referee_email");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referrer_user_id_referee_phone_key" ON "public"."referrals"("referrer_user_id", "referee_phone");

-- CreateIndex
CREATE INDEX "idx_role_permissions_role" ON "public"."role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "idx_role_permissions_permission" ON "public"."role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "public"."role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sms_templates_branch_id_type_name_key" ON "public"."sms_templates"("branch_id", "type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "public"."subscription_plans"("name");

-- CreateIndex
CREATE INDEX "idx_system_settings_branch_id" ON "public"."system_settings"("branch_id");

-- CreateIndex
CREATE INDEX "idx_system_settings_category_branch" ON "public"."system_settings"("category", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_branch_id_key_key" ON "public"."system_settings"("branch_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_user_id_key" ON "public"."team_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_employee_id_key" ON "public"."team_members"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_analytics_trainer_id_month_year_key" ON "public"."trainer_analytics"("trainer_id", "month", "year");

-- CreateIndex
CREATE INDEX "idx_assignments_trainer_id" ON "public"."trainer_assignments"("trainer_id");

-- CreateIndex
CREATE INDEX "idx_assignments_member_id" ON "public"."trainer_assignments"("member_id");

-- CreateIndex
CREATE INDEX "idx_assignments_scheduled_date" ON "public"."trainer_assignments"("scheduled_date");

-- CreateIndex
CREATE INDEX "idx_assignments_status" ON "public"."trainer_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_availability_trainer_id_day_of_week_key" ON "public"."trainer_availability"("trainer_id", "day_of_week");

-- CreateIndex
CREATE INDEX "idx_change_requests_status" ON "public"."trainer_change_requests"("status");

-- CreateIndex
CREATE INDEX "idx_change_requests_member_id" ON "public"."trainer_change_requests"("member_id");

-- CreateIndex
CREATE INDEX "idx_change_requests_current_trainer" ON "public"."trainer_change_requests"("current_trainer_id");

-- CreateIndex
CREATE INDEX "idx_change_requests_created_at" ON "public"."trainer_change_requests"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "trainer_profiles_user_id_key" ON "public"."trainer_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_profiles_employee_id_key" ON "public"."trainer_profiles"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_profiles_email_key" ON "public"."trainer_profiles"("email");

-- CreateIndex
CREATE INDEX "idx_trainers_branch_id" ON "public"."trainer_profiles"("branch_id");

-- CreateIndex
CREATE INDEX "idx_trainers_status" ON "public"."trainer_profiles"("status");

-- CreateIndex
CREATE INDEX "idx_trainers_rating" ON "public"."trainer_profiles"("rating" DESC);

-- CreateIndex
CREATE INDEX "idx_utilization_trainer_period_date" ON "public"."trainer_utilization"("trainer_id", "period", "date");

-- CreateIndex
CREATE INDEX "idx_utilization_date" ON "public"."trainer_utilization"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "trainer_utilization_trainer_id_period_date_key" ON "public"."trainer_utilization"("trainer_id", "period", "date");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_categories_branch_id_name_type_key" ON "public"."transaction_categories"("branch_id", "name", "type");

-- CreateIndex
CREATE INDEX "idx_user_notifications_member" ON "public"."user_notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_user_notifications_unread" ON "public"."user_notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "idx_user_roles_role" ON "public"."user_roles"("role_id");

-- CreateIndex
CREATE INDEX "idx_user_roles_user_id" ON "public"."user_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_branch_id_key" ON "public"."user_roles"("user_id", "role_id", "branch_id");

-- CreateIndex
CREATE INDEX "idx_payment_logs" ON "public"."payment_logs"("payment_id");

-- CreateIndex
CREATE INDEX "idx_gateway_logs" ON "public"."payment_logs"("gateway_type", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_link_token_key" ON "public"."payment_links"("link_token");

-- CreateIndex
CREATE INDEX "idx_payment_links_token" ON "public"."payment_links"("link_token");

-- CreateIndex
CREATE INDEX "idx_payment_links_member" ON "public"."payment_links"("member_id");

-- CreateIndex
CREATE INDEX "idx_email_logs_payment" ON "public"."email_logs"("payment_id");

-- CreateIndex
CREATE INDEX "idx_email_logs_member" ON "public"."email_logs"("member_id");

-- CreateIndex
CREATE INDEX "idx_sms_logs_payment" ON "public"."sms_logs"("payment_id");

-- CreateIndex
CREATE INDEX "idx_sms_logs_member" ON "public"."sms_logs"("member_id");

-- CreateIndex
CREATE INDEX "idx_notification_logs_member" ON "public"."notification_logs"("member_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_notification_logs_unread" ON "public"."notification_logs"("member_id", "is_read");

-- CreateIndex
CREATE INDEX "idx_notification_logs_branch" ON "public"."notification_logs"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_receipts_receipt_number_key" ON "public"."payment_receipts"("receipt_number");

-- CreateIndex
CREATE INDEX "idx_receipts_payment" ON "public"."payment_receipts"("payment_id");

-- CreateIndex
CREATE INDEX "idx_receipts_member" ON "public"."payment_receipts"("member_id");

-- CreateIndex
CREATE INDEX "idx_analytics_date" ON "public"."payment_analytics"("date");

-- CreateIndex
CREATE INDEX "idx_analytics_gateway" ON "public"."payment_analytics"("gateway_type");

-- CreateIndex
CREATE UNIQUE INDEX "unique_analytics" ON "public"."payment_analytics"("date", "gateway_type", "payment_type");

-- CreateIndex
CREATE UNIQUE INDEX "member_trainer_preferences_member_id_key" ON "public"."member_trainer_preferences"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "auto_assignment_config_branch_id_key" ON "public"."auto_assignment_config"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_reviews_trainer_id_member_id_assignment_id_key" ON "public"."trainer_reviews"("trainer_id", "member_id", "assignment_id");

-- CreateIndex
CREATE INDEX "_branchesTogyms_B_index" ON "public"."_branchesTogyms"("B");

-- AddForeignKey
ALTER TABLE "public"."ai_insights" ADD CONSTRAINT "ai_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_insights" ADD CONSTRAINT "ai_insights_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analytics_events" ADD CONSTRAINT "analytics_events_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_records" ADD CONSTRAINT "attendance_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_records" ADD CONSTRAINT "attendance_records_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_records" ADD CONSTRAINT "attendance_records_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."gym_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biometric_devices" ADD CONSTRAINT "biometric_devices_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."branch_analytics" ADD CONSTRAINT "branch_analytics_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_enrollments" ADD CONSTRAINT "class_enrollments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."gym_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_enrollments" ADD CONSTRAINT "class_enrollments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_transactions" ADD CONSTRAINT "credit_transactions_related_order_id_fkey" FOREIGN KEY ("related_order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_transactions" ADD CONSTRAINT "credit_transactions_related_bonus_id_fkey" FOREIGN KEY ("related_bonus_id") REFERENCES "public"."referral_bonus_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dashboard_metrics" ADD CONSTRAINT "dashboard_metrics_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diet_plans" ADD CONSTRAINT "diet_plans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diet_plans" ADD CONSTRAINT "diet_plans_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discount_codes" ADD CONSTRAINT "discount_codes_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment" ADD CONSTRAINT "equipment_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_analytics" ADD CONSTRAINT "equipment_analytics_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feedback" ADD CONSTRAINT "feedback_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feedback" ADD CONSTRAINT "feedback_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feedback_responses" ADD CONSTRAINT "feedback_responses_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feedback_responses" ADD CONSTRAINT "feedback_responses_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gym_classes" ADD CONSTRAINT "gym_classes_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gym_classes" ADD CONSTRAINT "gym_classes_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gym_usage" ADD CONSTRAINT "gym_usage_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gyms" ADD CONSTRAINT "gyms_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gyms" ADD CONSTRAINT "gyms_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_related_membership_id_fkey" FOREIGN KEY ("related_membership_id") REFERENCES "public"."member_memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_related_order_id_fkey" FOREIGN KEY ("related_order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_notes" ADD CONSTRAINT "lead_notes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_notes" ADD CONSTRAINT "lead_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_tasks" ADD CONSTRAINT "lead_tasks_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_tasks" ADD CONSTRAINT "lead_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."locker_assignments" ADD CONSTRAINT "locker_assignments_locker_id_fkey" FOREIGN KEY ("locker_id") REFERENCES "public"."lockers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."locker_assignments" ADD CONSTRAINT "locker_assignments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockers" ADD CONSTRAINT "lockers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockers" ADD CONSTRAINT "lockers_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "public"."locker_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockers" ADD CONSTRAINT "lockers_assigned_member_id_fkey" FOREIGN KEY ("assigned_member_id") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_records" ADD CONSTRAINT "maintenance_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_records" ADD CONSTRAINT "maintenance_records_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "public"."team_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_records" ADD CONSTRAINT "maintenance_records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_achievements" ADD CONSTRAINT "member_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_achievements" ADD CONSTRAINT "member_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_analytics" ADD CONSTRAINT "member_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_credits" ADD CONSTRAINT "member_credits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_diet_plans" ADD CONSTRAINT "member_diet_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_diet_plans" ADD CONSTRAINT "member_diet_plans_diet_plan_id_fkey" FOREIGN KEY ("diet_plan_id") REFERENCES "public"."diet_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_diet_plans" ADD CONSTRAINT "member_diet_plans_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_discount_usage" ADD CONSTRAINT "member_discount_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_discount_usage" ADD CONSTRAINT "member_discount_usage_discount_code_id_fkey" FOREIGN KEY ("discount_code_id") REFERENCES "public"."discount_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_discount_usage" ADD CONSTRAINT "member_discount_usage_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_goals" ADD CONSTRAINT "member_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_measurements" ADD CONSTRAINT "member_measurements_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_measurements" ADD CONSTRAINT "member_measurements_measured_by_fkey" FOREIGN KEY ("measured_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_memberships" ADD CONSTRAINT "member_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_memberships" ADD CONSTRAINT "member_memberships_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_workout_plans" ADD CONSTRAINT "member_workout_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_workout_plans" ADD CONSTRAINT "member_workout_plans_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_workout_plans" ADD CONSTRAINT "member_workout_plans_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."members" ADD CONSTRAINT "members_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."members" ADD CONSTRAINT "members_preferred_trainer_id_fkey" FOREIGN KEY ("preferred_trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_freeze_requests" ADD CONSTRAINT "membership_freeze_requests_member_membership_id_fkey" FOREIGN KEY ("member_membership_id") REFERENCES "public"."member_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_freeze_requests" ADD CONSTRAINT "membership_freeze_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_freeze_requests" ADD CONSTRAINT "membership_freeze_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_plans" ADD CONSTRAINT "membership_plans_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_gateway_configs" ADD CONSTRAINT "payment_gateway_configs_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_gateway_configs" ADD CONSTRAINT "payment_gateway_configs_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_gateway_transactions" ADD CONSTRAINT "payment_gateway_transactions_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_gateway_transactions" ADD CONSTRAINT "payment_gateway_transactions_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_gateway_transactions" ADD CONSTRAINT "payment_gateway_transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_gateway_transactions" ADD CONSTRAINT "payment_gateway_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_gateway_transactions" ADD CONSTRAINT "payment_gateway_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_gateway_transactions" ADD CONSTRAINT "payment_gateway_transactions_gateway_config_id_fkey" FOREIGN KEY ("gateway_config_id") REFERENCES "public"."payment_gateway_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_initiated_by_fkey" FOREIGN KEY ("initiated_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_entries" ADD CONSTRAINT "progress_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_entries" ADD CONSTRAINT "progress_entries_related_goal_id_fkey" FOREIGN KEY ("related_goal_id") REFERENCES "public"."member_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_entries" ADD CONSTRAINT "progress_entries_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_photos" ADD CONSTRAINT "progress_photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_photos" ADD CONSTRAINT "progress_photos_related_entry_id_fkey" FOREIGN KEY ("related_entry_id") REFERENCES "public"."progress_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_analytics" ADD CONSTRAINT "referral_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_bonus_history" ADD CONSTRAINT "referral_bonus_history_referrer_user_id_fkey" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_bonus_history" ADD CONSTRAINT "referral_bonus_history_referee_user_id_fkey" FOREIGN KEY ("referee_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_bonus_history" ADD CONSTRAINT "referral_bonus_history_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_bonus_history" ADD CONSTRAINT "referral_bonus_history_related_transaction_id_fkey" FOREIGN KEY ("related_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_bonuses" ADD CONSTRAINT "referral_bonuses_referral_setting_id_fkey" FOREIGN KEY ("referral_setting_id") REFERENCES "public"."referral_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_settings" ADD CONSTRAINT "referral_settings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_settings" ADD CONSTRAINT "referral_settings_default_bonus_id_fkey" FOREIGN KEY ("default_bonus_id") REFERENCES "public"."referral_bonuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referrals" ADD CONSTRAINT "referrals_referrer_user_id_fkey" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referrals" ADD CONSTRAINT "referrals_referee_user_id_fkey" FOREIGN KEY ("referee_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sms_templates" ADD CONSTRAINT "sms_templates_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sms_templates" ADD CONSTRAINT "sms_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_settings" ADD CONSTRAINT "system_settings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."team_members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."trainer_analytics" ADD CONSTRAINT "trainer_analytics_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_assignments" ADD CONSTRAINT "trainer_assignments_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_assignments" ADD CONSTRAINT "trainer_assignments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_assignments" ADD CONSTRAINT "trainer_assignments_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."trainer_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_assignments" ADD CONSTRAINT "trainer_assignments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_availability" ADD CONSTRAINT "trainer_availability_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_certifications" ADD CONSTRAINT "trainer_certifications_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_change_requests" ADD CONSTRAINT "trainer_change_requests_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_change_requests" ADD CONSTRAINT "trainer_change_requests_current_trainer_id_fkey" FOREIGN KEY ("current_trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_change_requests" ADD CONSTRAINT "trainer_change_requests_requested_trainer_id_fkey" FOREIGN KEY ("requested_trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_change_requests" ADD CONSTRAINT "trainer_change_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_change_requests" ADD CONSTRAINT "trainer_change_requests_new_trainer_id_fkey" FOREIGN KEY ("new_trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_package_rates" ADD CONSTRAINT "trainer_package_rates_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_package_rates" ADD CONSTRAINT "trainer_package_rates_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_packages" ADD CONSTRAINT "trainer_packages_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_packages" ADD CONSTRAINT "trainer_packages_package_rate_id_fkey" FOREIGN KEY ("package_rate_id") REFERENCES "public"."trainer_package_rates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_packages" ADD CONSTRAINT "trainer_packages_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_packages" ADD CONSTRAINT "trainer_packages_related_invoice_id_fkey" FOREIGN KEY ("related_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_profiles" ADD CONSTRAINT "trainer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_profiles" ADD CONSTRAINT "trainer_profiles_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_utilization" ADD CONSTRAINT "trainer_utilization_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_categories" ADD CONSTRAINT "transaction_categories_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."transaction_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_notifications" ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whatsapp_templates" ADD CONSTRAINT "whatsapp_templates_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whatsapp_templates" ADD CONSTRAINT "whatsapp_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_shifts" ADD CONSTRAINT "work_shifts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workout_plans" ADD CONSTRAINT "workout_plans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workout_plans" ADD CONSTRAINT "workout_plans_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_logs" ADD CONSTRAINT "payment_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_links" ADD CONSTRAINT "payment_links_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sms_logs" ADD CONSTRAINT "sms_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_logs" ADD CONSTRAINT "notification_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_logs" ADD CONSTRAINT "notification_logs_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_receipts" ADD CONSTRAINT "payment_receipts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_request_workflow" ADD CONSTRAINT "change_request_workflow_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."trainer_change_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."auto_assignment_config" ADD CONSTRAINT "auto_assignment_config_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_reviews" ADD CONSTRAINT "trainer_reviews_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trainer_reviews" ADD CONSTRAINT "trainer_reviews_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."trainer_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."trainer_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."trainer_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_branchesTogyms" ADD CONSTRAINT "_branchesTogyms_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_branchesTogyms" ADD CONSTRAINT "_branchesTogyms_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
