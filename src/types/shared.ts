/**
 * Shared Type Definitions
 * Common types used across the application
 */

// ============= API Response Types =============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: ApiMeta;
  pagination?: PaginationInfo;
}

export interface ApiMeta {
  timestamp: string;
  version: string;
  requestId?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// ============= Query Parameter Types =============

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export interface FilterParams {
  status?: string;
  is_active?: boolean;
  branch_id?: string;
  gym_id?: string;
}

// ============= Form Data Types =============

export interface BaseFormData {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData extends BaseFormData {
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  branch_id?: string;
  gym_id?: string;
  is_active?: boolean;
}

export interface MemberFormData extends BaseFormData {
  user_id: string;
  membership_plan_id?: string;
  date_of_birth?: string;
  gender?: string;
  emergency_contact?: string;
  medical_conditions?: string;
  fitness_goals?: string[];
}

export interface MembershipFormData extends BaseFormData {
  name: string;
  description?: string;
  duration_months: number;
  price: number;
  features?: string[];
  is_active?: boolean;
}

export interface ClassFormData extends BaseFormData {
  name: string;
  description?: string;
  trainer_id: string;
  capacity: number;
  duration_minutes: number;
  schedule?: string;
}

// ============= Stats & Analytics Types =============

export interface StatsData {
  total: number;
  active: number;
  inactive: number;
  growth?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

export interface RevenueStats {
  total_revenue: number;
  monthly_revenue: number;
  pending_payments: number;
  overdue_payments: number;
}

export interface MembershipStats {
  total_members: number;
  active_members: number;
  expiring_soon: number;
  new_this_month: number;
}

// ============= File Upload Types =============

export interface FileUploadData {
  file: File;
  path?: string;
  public_url?: string;
  size?: number;
  type?: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
  uploaded_at: string;
}

// ============= Notification Types =============

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  user_id: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

// ============= Error Types =============

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiErrorData {
  message: string;
  code?: string;
  field?: string;
  details?: any;
  validation_errors?: ValidationError[];
}

// ============= Table Column Types =============

export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface TableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  disabled?: (row: T) => boolean;
}

// ============= Filter & Sort Types =============

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SortOption {
  label: string;
  value: string;
  direction: 'asc' | 'desc';
}

// ============= Export Types =============

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  columns?: string[];
  filters?: Record<string, any>;
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

// ============= Utility Types =============

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T | null>;

export interface KeyValue<T = any> {
  key: string;
  value: T;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

// ============= Date & Time Types =============

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface DateRange {
  start: Date | string;
  end: Date | string;
}

export interface Schedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
}
