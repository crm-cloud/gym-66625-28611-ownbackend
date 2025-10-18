
import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Branch, BranchStats } from '@/types/branch';

// Mock branch data
const mockBranches: Branch[] = [
  {
    id: '1',
    name: 'Downtown Fitness Center',
    address: {
      street: '123 Main Street',
      city: 'Downtown',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'downtown@gymfit.com',
      website: 'https://downtown.gymfit.com'
    },
    hours: {
      monday: { open: '05:00', close: '23:00' },
      tuesday: { open: '05:00', close: '23:00' },
      wednesday: { open: '05:00', close: '23:00' },
      thursday: { open: '05:00', close: '23:00' },
      friday: { open: '05:00', close: '23:00' },
      saturday: { open: '06:00', close: '22:00' },
      sunday: { open: '07:00', close: '21:00' }
    },
    amenities: ['Pool', 'Sauna', 'Personal Training', 'Group Classes', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ],
    status: 'active',
    capacity: 500,
    currentMembers: 387,
    manager: {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@gymfit.com'
    },
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Westside Athletic Club',
    address: {
      street: '456 Ocean Avenue',
      city: 'Westside',
      state: 'CA',
      zipCode: '90405',
      country: 'USA'
    },
    contact: {
      phone: '+1 (555) 234-5678',
      email: 'westside@gymfit.com'
    },
    hours: {
      monday: { open: '05:30', close: '22:30' },
      tuesday: { open: '05:30', close: '22:30' },
      wednesday: { open: '05:30', close: '22:30' },
      thursday: { open: '05:30', close: '22:30' },
      friday: { open: '05:30', close: '22:30' },
      saturday: { open: '06:30', close: '21:30' },
      sunday: { open: '07:30', close: '20:30' }
    },
    amenities: ['Beach Access', 'Outdoor Training', 'Yoga Studio', 'Juice Bar'],
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ],
    status: 'active',
    capacity: 300,
    currentMembers: 245,
    manager: {
      id: '2',
      name: 'Mike Rodriguez',
      email: 'mike@gymfit.com'
    },
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  }
];

const mockBranchStats: Record<string, BranchStats> = {
  '1': {
    totalMembers: 387,
    activeMembers: 342,
    revenue: 28500,
    equipmentStatus: 98,
    classesThisWeek: 24,
    avgRating: 4.8
  },
  '2': {
    totalMembers: 245,
    activeMembers: 210,
    revenue: 18200,
    equipmentStatus: 95,
    classesThisWeek: 18,
    avgRating: 4.6
  }
};

const BranchContext = createContext<{
  branches: Branch[];
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  getBranchStats: (branchId: string) => BranchStats | null;
  isLoading: boolean;
}>({
  branches: [],
  selectedBranch: null,
  setSelectedBranch: () => {},
  getBranchStats: () => null,
  isLoading: false
});

export const useBranches = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranches must be used within BranchProvider');
  }
  return context;
};

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const [branches] = useState<Branch[]>(mockBranches);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(mockBranches[0]);
  const [isLoading] = useState(false);

  const getBranchStats = (branchId: string): BranchStats | null => {
    return mockBranchStats[branchId] || null;
  };

  return (
    <BranchContext.Provider value={{
      branches,
      selectedBranch,
      setSelectedBranch,
      getBranchStats,
      isLoading
    }}>
      {children}
    </BranchContext.Provider>
  );
};
