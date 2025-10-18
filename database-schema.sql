-- Payment Gateway Management System Database Schema
-- For Muscle Garage Gym Management System
-- Complete payment integration with multiple gateways

-- ==========================================
-- PAYMENT GATEWAY CONFIGURATION
-- ==========================================

-- Payment Gateways Configuration
CREATE TABLE payment_gateways (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('razorpay', 'payu', 'phonepe', 'ccavenue') NOT NULL,
    is_active BOOLEAN DEFAULT false,
    environment ENUM('sandbox', 'live') DEFAULT 'sandbox',
    api_key VARCHAR(500),
    api_secret VARCHAR(500),
    merchant_id VARCHAR(200),
    webhook_secret VARCHAR(500),
    additional_config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Main Payments Table
CREATE TABLE payments (
    id VARCHAR(50) PRIMARY KEY,
    txn_id VARCHAR(100) UNIQUE NOT NULL,
    order_id VARCHAR(100),
    payment_reference VARCHAR(100),
    member_id VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_type ENUM('membership', 'pos', 'invoice', 'training_fee') NOT NULL,
    gateway_type ENUM('razorpay', 'payu', 'phonepe', 'ccavenue') NOT NULL,
    payment_method ENUM('card', 'upi', 'netbanking', 'wallet', 'cash') NOT NULL,
    status ENUM('pending', 'processing', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    invoice_id VARCHAR(50),
    membership_id VARCHAR(50),
    pos_order_id VARCHAR(50),
    training_package_id VARCHAR(50),
    gateway_response JSON,
    failure_reason TEXT,
    initiated_by VARCHAR(50),
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_member_payments (member_id),
    INDEX idx_payment_status (status),
    INDEX idx_payment_type (payment_type),
    INDEX idx_txn_id (txn_id)
);

-- Payment Logs for Webhook Tracking
CREATE TABLE payment_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(50),
    gateway_type ENUM('razorpay', 'payu', 'phonepe', 'ccavenue') NOT NULL,
    log_type ENUM('webhook', 'api_call', 'callback', 'error') NOT NULL,
    request_payload JSON,
    response_payload JSON,
    headers JSON,
    status_code INT,
    processing_status ENUM('received', 'processed', 'failed') DEFAULT 'received',
    error_message TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    
    INDEX idx_payment_logs (payment_id),
    INDEX idx_gateway_logs (gateway_type, received_at)
);

-- Payment Links (for email/SMS sharing)
CREATE TABLE payment_links (
    id VARCHAR(50) PRIMARY KEY,
    payment_id VARCHAR(50) NOT NULL,
    link_token VARCHAR(100) UNIQUE NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type ENUM('membership', 'pos', 'invoice', 'training_fee') NOT NULL,
    description TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP NULL,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_payment_links_token (link_token),
    INDEX idx_payment_links_member (member_id)
);

-- Email Notifications Log
CREATE TABLE email_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(50),
    member_id VARCHAR(50),
    email_type ENUM('payment_success', 'payment_failed', 'payment_link', 'invoice') NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    email_body TEXT,
    template_used VARCHAR(100),
    delivery_status ENUM('queued', 'sent', 'delivered', 'failed', 'bounced') DEFAULT 'queued',
    provider_response JSON,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    
    INDEX idx_email_logs_payment (payment_id),
    INDEX idx_email_logs_member (member_id)
);

-- SMS Notifications Log
CREATE TABLE sms_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(50),
    member_id VARCHAR(50),
    sms_type ENUM('payment_success', 'payment_failed', 'payment_link', 'reminder') NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    template_used VARCHAR(100),
    delivery_status ENUM('queued', 'sent', 'delivered', 'failed') DEFAULT 'queued',
    provider VARCHAR(50),
    provider_response JSON,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    
    INDEX idx_sms_logs_payment (payment_id),
    INDEX idx_sms_logs_member (member_id)
);

-- In-App Notifications Log
CREATE TABLE notification_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(50),
    member_id VARCHAR(50) NOT NULL,
    notification_type ENUM('payment_success', 'payment_failed', 'payment_reminder', 'receipt_ready') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_notifications_member (member_id, created_at),
    INDEX idx_notifications_unread (member_id, is_read)
);

-- Payment Receipts/Invoices
CREATE TABLE payment_receipts (
    id VARCHAR(50) PRIMARY KEY,
    payment_id VARCHAR(50) NOT NULL,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    invoice_data JSON NOT NULL,
    pdf_path VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(50),
    
    INDEX idx_receipts_payment (payment_id),
    INDEX idx_receipts_member (member_id)
);

-- Payment Gateway Analytics
CREATE TABLE payment_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    gateway_type ENUM('razorpay', 'payu', 'phonepe', 'ccavenue') NOT NULL,
    payment_type ENUM('membership', 'pos', 'invoice', 'training_fee') NOT NULL,
    total_transactions INT DEFAULT 0,
    successful_transactions INT DEFAULT 0,
    failed_transactions INT DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    successful_amount DECIMAL(12,2) DEFAULT 0.00,
    average_transaction_value DECIMAL(10,2) DEFAULT 0.00,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_analytics (date, gateway_type, payment_type),
    INDEX idx_analytics_date (date),
    INDEX idx_analytics_gateway (gateway_type)
);

-- Insert default payment gateway configurations
INSERT INTO payment_gateways (id, name, type, is_active, environment) VALUES
('razorpay_sandbox', 'Razorpay Sandbox', 'razorpay', true, 'sandbox'),
('razorpay_live', 'Razorpay Live', 'razorpay', false, 'live'),
('payu_sandbox', 'PayU Sandbox', 'payu', true, 'sandbox'),
('payu_live', 'PayU Live', 'payu', false, 'live'),
('phonepe_sandbox', 'PhonePe Sandbox', 'phonepe', true, 'sandbox'),
('phonepe_live', 'PhonePe Live', 'phonepe', false, 'live'),
('ccavenue_sandbox', 'CCAvenue Sandbox', 'ccavenue', true, 'sandbox'),
('ccavenue_live', 'CCAvenue Live', 'ccavenue', false, 'live');

-- ==========================================
-- EXISTING TRAINER MANAGEMENT SCHEMA
-- ==========================================

-- ==========================================
-- TRAINER TABLES
-- ==========================================

-- Trainers table (extends the existing trainer profile)
CREATE TABLE trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    branch_id UUID NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    
    -- Personal Information
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    date_of_birth DATE,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Professional Information
    specialties TEXT[] NOT NULL DEFAULT '{}', -- Array of specialty types
    experience INTEGER NOT NULL DEFAULT 0, -- Years of experience
    bio TEXT,
    languages TEXT[] NOT NULL DEFAULT '{"English"}',
    
    -- Availability & Scheduling
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'busy')),
    max_clients_per_day INTEGER NOT NULL DEFAULT 8,
    max_clients_per_week INTEGER NOT NULL DEFAULT 40,
    
    -- Pricing & Services
    hourly_rate DECIMAL(10,2) NOT NULL,
    
    -- Performance Metrics
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_sessions INTEGER DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    completion_rate INTEGER DEFAULT 100 CHECK (completion_rate >= 0 AND completion_rate <= 100),
    punctuality_score INTEGER DEFAULT 100 CHECK (punctuality_score >= 0 AND punctuality_score <= 100),
    
    -- System Fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trainer Certifications
CREATE TABLE trainer_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('basic', 'intermediate', 'advanced', 'expert')),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trainer Availability
CREATE TABLE trainer_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(trainer_id, day_of_week)
);

-- Training Package Rates
CREATE TABLE trainer_package_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    sessions INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    validity_days INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BOOKING & ASSIGNMENT TABLES
-- ==========================================

-- Trainer Assignments (Sessions)
CREATE TABLE trainer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    member_id UUID NOT NULL, -- References members table
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('single', 'package')),
    package_id UUID, -- References purchased packages
    
    -- Session Details
    scheduled_date TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60, -- Minutes
    session_specialty VARCHAR(50) NOT NULL,
    notes TEXT,
    
    -- Status & Tracking
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
    completed_at TIMESTAMPTZ,
    member_rating INTEGER CHECK (member_rating >= 1 AND member_rating <= 5),
    member_feedback TEXT,
    trainer_notes TEXT,
    
    -- Payment Information
    is_paid BOOLEAN DEFAULT false,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMPTZ,
    payment_method VARCHAR(50),
    
    -- Auto-assignment metadata
    assigned_by VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (assigned_by IN ('auto', 'manual', 'member_request')),
    assignment_reason TEXT,
    alternative_trainers TEXT[], -- Array of trainer IDs
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Packages (for package purchases)
CREATE TABLE training_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    package_rate_id UUID REFERENCES trainer_package_rates(id),
    
    sessions_total INTEGER NOT NULL,
    sessions_used INTEGER DEFAULT 0,
    sessions_remaining INTEGER GENERATED ALWAYS AS (sessions_total - sessions_used) STORED,
    
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'completed')),
    
    -- Payment Information
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_id VARCHAR(255), -- Stripe/Payment processor ID
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TRAINER CHANGE REQUEST SYSTEM
-- ==========================================

-- Trainer Change Requests
CREATE TABLE trainer_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    current_trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    requested_trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL, -- Optional specific request
    
    -- Request Details
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('scheduling_conflict', 'personality_mismatch', 'specialty_change', 'performance_issue', 'other')),
    description TEXT NOT NULL,
    urgency VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    
    -- Workflow Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    
    -- Review Information
    reviewed_by UUID, -- Admin/Manager user ID
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- New Assignment (if approved)
    new_trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    reassignment_date TIMESTAMPTZ,
    
    -- Notification tracking
    member_notified BOOLEAN DEFAULT false,
    trainer_notified BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change Request Workflow Log
CREATE TABLE change_request_workflow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES trainer_change_requests(id) ON DELETE CASCADE,
    status_from VARCHAR(20),
    status_to VARCHAR(20) NOT NULL,
    changed_by UUID NOT NULL, -- User ID
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- UTILIZATION TRACKING
-- ==========================================

-- Trainer Utilization Metrics
CREATE TABLE trainer_utilization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    period VARCHAR(10) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
    date DATE NOT NULL,
    
    -- Capacity Metrics
    total_available_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
    booked_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
    utilization_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_available_hours > 0 THEN (booked_hours / total_available_hours) * 100
            ELSE 0 
        END
    ) STORED,
    
    -- Session Metrics
    scheduled_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    cancelled_sessions INTEGER DEFAULT 0,
    no_show_sessions INTEGER DEFAULT 0,
    
    -- Revenue Metrics
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_session_value DECIMAL(10,2) DEFAULT 0,
    
    -- Performance Metrics
    average_rating DECIMAL(3,2) DEFAULT 0,
    punctuality_score INTEGER DEFAULT 100,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(trainer_id, period, date)
);

-- ==========================================
-- TRAINER PREFERENCES & AUTO-ASSIGNMENT
-- ==========================================

-- Member Trainer Preferences
CREATE TABLE member_trainer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    preferred_specialties TEXT[] DEFAULT '{}',
    preferred_gender VARCHAR(10) CHECK (preferred_gender IN ('male', 'female')),
    preferred_experience_level VARCHAR(20) DEFAULT 'any' CHECK (preferred_experience_level IN ('any', 'beginner_friendly', 'experienced', 'expert')),
    preferred_languages TEXT[] DEFAULT '{"English"}',
    avoid_trainer_ids TEXT[] DEFAULT '{}',
    max_hourly_rate DECIMAL(10,2),
    
    -- Scheduling preferences
    preferred_time_slots JSONB, -- Array of {day_of_week, start_time, end_time}
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(member_id)
);

-- Auto-Assignment Configuration
CREATE TABLE auto_assignment_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    
    -- Assignment Rules
    priority_factors TEXT[] DEFAULT '{"specialty_match", "availability", "rating", "experience", "price"}',
    require_specialty_match BOOLEAN DEFAULT true,
    require_availability BOOLEAN DEFAULT true,
    max_price_threshold DECIMAL(10,2),
    min_rating_threshold DECIMAL(3,2) DEFAULT 3.0,
    min_experience_threshold INTEGER DEFAULT 1,
    
    -- Load Balancing
    enable_load_balancing BOOLEAN DEFAULT true,
    max_utilization_threshold INTEGER DEFAULT 80, -- Percentage
    
    -- Fallback Options
    allow_manual_assignment BOOLEAN DEFAULT true,
    notify_on_no_match BOOLEAN DEFAULT true,
    waitlist_on_no_match BOOLEAN DEFAULT false,
    
    -- Timing
    assignment_window_hours INTEGER DEFAULT 24,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(branch_id)
);

-- ==========================================
-- MARKETPLACE & E-COMMERCE
-- ==========================================

-- Trainer Marketplace Reviews
CREATE TABLE trainer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    assignment_id UUID REFERENCES trainer_assignments(id) ON DELETE SET NULL,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    -- Review categories
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    knowledge_rating INTEGER CHECK (knowledge_rating >= 1 AND knowledge_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(trainer_id, member_id, assignment_id)
);

-- Payment Transactions
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    package_id UUID REFERENCES training_packages(id) ON DELETE SET NULL,
    assignment_id UUID REFERENCES trainer_assignments(id) ON DELETE SET NULL,
    
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('package_purchase', 'single_session', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment processor details
    payment_processor VARCHAR(20) DEFAULT 'stripe',
    payment_method VARCHAR(20), -- card, bank_transfer, etc.
    processor_transaction_id VARCHAR(255),
    processor_fee DECIMAL(10,2) DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Metadata
    payment_metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Trainer indexes
CREATE INDEX idx_trainers_branch_id ON trainers(branch_id);
CREATE INDEX idx_trainers_status ON trainers(status) WHERE status = 'active';
CREATE INDEX idx_trainers_specialties ON trainers USING GIN(specialties);
CREATE INDEX idx_trainers_rating ON trainers(rating DESC);

-- Assignment indexes
CREATE INDEX idx_assignments_trainer_id ON trainer_assignments(trainer_id);
CREATE INDEX idx_assignments_member_id ON trainer_assignments(member_id);
CREATE INDEX idx_assignments_scheduled_date ON trainer_assignments(scheduled_date);
CREATE INDEX idx_assignments_status ON trainer_assignments(status);

-- Change request indexes
CREATE INDEX idx_change_requests_status ON trainer_change_requests(status);
CREATE INDEX idx_change_requests_member_id ON trainer_change_requests(member_id);
CREATE INDEX idx_change_requests_current_trainer ON trainer_change_requests(current_trainer_id);
CREATE INDEX idx_change_requests_created_at ON trainer_change_requests(created_at DESC);

-- Utilization indexes
CREATE INDEX idx_utilization_trainer_period_date ON trainer_utilization(trainer_id, period, date);
CREATE INDEX idx_utilization_date ON trainer_utilization(date DESC);

-- ==========================================
-- TRIGGERS FOR AUTOMATION
-- ==========================================

-- Update trainer metrics when assignments change
CREATE OR REPLACE FUNCTION update_trainer_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total sessions and completion rate
    UPDATE trainers SET
        total_sessions = (
            SELECT COUNT(*) 
            FROM trainer_assignments 
            WHERE trainer_id = COALESCE(NEW.trainer_id, OLD.trainer_id)
        ),
        completion_rate = (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 100
                ELSE (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*) * 100)::INTEGER
            END
            FROM trainer_assignments 
            WHERE trainer_id = COALESCE(NEW.trainer_id, OLD.trainer_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.trainer_id, OLD.trainer_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trainer_metrics
    AFTER INSERT OR UPDATE OR DELETE ON trainer_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_trainer_metrics();

-- Update package sessions used
CREATE OR REPLACE FUNCTION update_package_sessions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') AND NEW.package_id IS NOT NULL THEN
        UPDATE training_packages SET
            sessions_used = sessions_used + 1,
            updated_at = NOW()
        WHERE id = NEW.package_id;
        
        -- Check if package is completed
        UPDATE training_packages SET
            status = 'completed'
        WHERE id = NEW.package_id AND sessions_used >= sessions_total;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_package_sessions
    AFTER INSERT OR UPDATE ON trainer_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_package_sessions();

-- Log change request workflow
CREATE OR REPLACE FUNCTION log_change_request_workflow()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO change_request_workflow (request_id, status_from, status_to, changed_by, notes)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.reviewed_by, NEW.review_notes);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_change_request_workflow
    AFTER UPDATE ON trainer_change_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_change_request_workflow();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on sensitive tables
ALTER TABLE trainer_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_trainer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Members can only see their own change requests
CREATE POLICY member_change_requests ON trainer_change_requests
    FOR ALL USING (member_id = auth.uid());

-- Members can only manage their own preferences
CREATE POLICY member_preferences ON member_trainer_preferences
    FOR ALL USING (member_id = auth.uid());

-- Members can only see their own payment transactions
CREATE POLICY member_transactions ON payment_transactions
    FOR ALL USING (member_id = auth.uid());

-- ==========================================
-- SAMPLE DATA VIEWS
-- ==========================================

-- Trainer dashboard view
CREATE OR REPLACE VIEW trainer_dashboard AS
SELECT 
    t.id,
    t.full_name,
    t.rating,
    t.total_sessions,
    t.hourly_rate,
    COUNT(ta.id) FILTER (WHERE ta.scheduled_date >= CURRENT_DATE) as upcoming_sessions,
    COUNT(ta.id) FILTER (WHERE ta.scheduled_date >= CURRENT_DATE - INTERVAL '7 days' AND ta.status = 'completed') as sessions_this_week,
    AVG(ta.member_rating) as recent_avg_rating,
    SUM(ta.amount) FILTER (WHERE ta.payment_date >= CURRENT_DATE - INTERVAL '30 days' AND ta.is_paid = true) as revenue_this_month
FROM trainers t
LEFT JOIN trainer_assignments ta ON t.id = ta.trainer_id
WHERE t.is_active = true
GROUP BY t.id, t.full_name, t.rating, t.total_sessions, t.hourly_rate;

-- Change requests summary view
CREATE OR REPLACE VIEW change_requests_summary AS
SELECT 
    tcr.id,
    tcr.member_id,
    current_trainer.full_name as current_trainer_name,
    requested_trainer.full_name as requested_trainer_name,
    tcr.reason,
    tcr.urgency,
    tcr.status,
    tcr.created_at,
    tcr.reviewed_at,
    EXTRACT(days FROM (CURRENT_TIMESTAMP - tcr.created_at)) as days_pending
FROM trainer_change_requests tcr
LEFT JOIN trainers current_trainer ON tcr.current_trainer_id = current_trainer.id
LEFT JOIN trainers requested_trainer ON tcr.requested_trainer_id = requested_trainer.id
ORDER BY tcr.created_at DESC;