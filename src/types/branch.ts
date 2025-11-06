export interface Branch {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  operating_hours: Record<string, unknown> | null;
  is_active: boolean | null;
  timezone: string | null;
  gym_id: string | null;
  manager_id: string | null;
  max_capacity: number | null;
  current_occupancy: number | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Backward compatibility - will be deprecated
  status?: 'active' | 'inactive' | 'maintenance';
  capacity?: number;
  current_members?: number;
  currentMembers?: number;
  contact?: { phone: string; email: string };
  manager?: { id: string; name: string; email: string };
  images?: string[];
  amenities?: string[];
  hours?: Record<string, { open: string; close: string }>;
}

export interface BranchStats {
  totalMembers: number;
  activeMembers: number;
  revenue: number;
  equipmentStatus: number;
  classesThisWeek: number;
  avgRating: number;
}
