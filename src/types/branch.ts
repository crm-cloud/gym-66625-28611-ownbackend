
export interface Branch {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  hours: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive' | 'maintenance';
  capacity: number;
  currentMembers: number;
  manager: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BranchStats {
  totalMembers: number;
  activeMembers: number;
  revenue: number;
  equipmentStatus: number;
  classesThisWeek: number;
  avgRating: number;
}
