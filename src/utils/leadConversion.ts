
import { Lead } from '@/types/lead';
import { Member, MemberFormData } from '@/types/member';
import { MembershipAssignment, Invoice } from '@/types/membership';

// Generate unique member ID
export const generateMemberId = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `MEM${timestamp}${random}`;
};

// Generate invoice number
export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `INV${timestamp}${random}`;
};

// Convert lead to member data structure
export const convertLeadToMember = (
  lead: Lead,
  memberFormData: MemberFormData,
  createdBy: string = 'system'
): Member => {
  const memberId = generateMemberId();
  const now = new Date();

  return {
    id: memberId,
    fullName: memberFormData.fullName,
    phone: memberFormData.phone,
    email: memberFormData.email,
    dateOfBirth: memberFormData.dateOfBirth,
    gender: memberFormData.gender,
    address: memberFormData.address,
    governmentId: memberFormData.governmentId,
    measurements: memberFormData.measurements,
    emergencyContact: memberFormData.emergencyContact,
    profilePhoto: memberFormData.profilePhoto,
    branchId: memberFormData.branchId,
    branchName: getBranchNameById(memberFormData.branchId),
    membershipStatus: 'active',
    trainerId: memberFormData.trainerId,
    trainerName: memberFormData.trainerId ? getTrainerNameById(memberFormData.trainerId) : undefined,
    joinedDate: now,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
};

// Create membership assignment
export const createMembershipAssignment = (
  member: Member,
  membershipData: {
    planId: string;
    startDate: Date;
    discountPercent?: number;
    discountAmount?: number;
    gstEnabled: boolean;
  },
  createdBy: string = 'system'
): MembershipAssignment => {
  const plan = getMembershipPlanById(membershipData.planId);
  if (!plan) {
    throw new Error('Membership plan not found');
  }

  const now = new Date();
  const endDate = new Date(membershipData.startDate);
  endDate.setDate(endDate.getDate() + plan.duration);

  const originalPrice = plan.price;
  const discountAmount = membershipData.discountAmount || 
    (membershipData.discountPercent ? (originalPrice * membershipData.discountPercent) / 100 : 0);
  const discountedPrice = originalPrice - discountAmount;
  const gstAmount = membershipData.gstEnabled ? (discountedPrice * 18) / 100 : 0;
  const finalAmount = discountedPrice + gstAmount;

  return {
    id: `assignment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    memberId: member.id,
    memberName: member.fullName,
    planId: membershipData.planId,
    planName: plan.name,
    startDate: membershipData.startDate,
    endDate,
    originalPrice,
    discountPercent: membershipData.discountPercent,
    discountAmount,
    gstEnabled: membershipData.gstEnabled,
    gstAmount,
    finalAmount,
    branchId: member.branchId,
    branchName: member.branchName,
    isActive: true,
    createdBy,
    createdAt: now,
  };
};

// Create invoice for membership
export const createMembershipInvoice = (
  membershipAssignment: MembershipAssignment
): Invoice => {
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 7); // 7 days due date

  return {
    id: `invoice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    invoiceNumber: generateInvoiceNumber(),
    membershipId: membershipAssignment.id,
    memberId: membershipAssignment.memberId,
    memberName: membershipAssignment.memberName,
    planName: membershipAssignment.planName,
    originalAmount: membershipAssignment.originalPrice,
    discountAmount: membershipAssignment.discountAmount || 0,
    gstAmount: membershipAssignment.gstAmount,
    finalAmount: membershipAssignment.finalAmount,
    issueDate: now,
    dueDate,
    paymentStatus: 'unpaid',
    branchId: membershipAssignment.branchId,
    branchName: membershipAssignment.branchName,
    createdAt: now,
  };
};

// Log conversion activity
export interface ConversionLog {
  id: string;
  leadId: string;
  memberId: string;
  leadName: string;
  memberName: string;
  convertedBy: string;
  conversionDate: Date;
  membershipPlan: string;
  notes?: string;
  originalLeadData: Partial<Lead>;
}

export const createConversionLog = (
  lead: Lead,
  member: Member,
  membershipAssignment: MembershipAssignment,
  convertedBy: string,
  notes?: string
): ConversionLog => {
  return {
    id: `conversion_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    leadId: lead.id,
    memberId: member.id,
    leadName: `${lead.firstName} ${lead.lastName}`,
    memberName: member.fullName,
    convertedBy,
    conversionDate: new Date(),
    membershipPlan: membershipAssignment.planName,
    notes,
    originalLeadData: {
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      priority: lead.priority,
      interestedPrograms: lead.interestedPrograms,
      estimatedValue: lead.estimatedValue,
      createdAt: lead.createdAt,
    },
  };
};

// Update lead status to converted
export const updateLeadToConverted = (lead: Lead, conversionDate: Date = new Date()): Lead => {
  return {
    ...lead,
    status: 'converted',
    conversionDate,
    updatedAt: new Date(),
  };
};

// Helper functions (these would normally come from your data layer)
const getBranchNameById = (branchId: string): string => {
  // This would typically fetch from your branches data
  const branches = [
    { id: 'branch1', name: 'Downtown Branch' },
    { id: 'branch2', name: 'Uptown Branch' },
    { id: 'branch3', name: 'Suburban Branch' },
  ];
  return branches.find(b => b.id === branchId)?.name || 'Unknown Branch';
};

const getTrainerNameById = (trainerId: string): string => {
  // This would typically fetch from your trainers data
  const trainers = [
    { id: 'trainer1', name: 'John Smith' },
    { id: 'trainer2', name: 'Sarah Johnson' },
    { id: 'trainer3', name: 'Mike Wilson' },
  ];
  return trainers.find(t => t.id === trainerId)?.name || 'Unknown Trainer';
};

const getMembershipPlanById = (planId: string) => {
  // This would typically fetch from your membership plans data
  const plans = [
    {
      id: 'plan1',
      name: 'Basic Monthly',
      price: 2000,
      duration: 30,
      accessTypes: ['gym'],
      classesAllowed: 0,
      description: 'Basic gym access',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'plan2',
      name: 'Premium Monthly',
      price: 4000,
      duration: 30,
      accessTypes: ['gym', 'classes', 'pool'],
      classesAllowed: -1,
      description: 'Full access with unlimited classes',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  return plans.find(p => p.id === planId);
};

// Complete conversion process
export const processLeadConversion = async (
  lead: Lead,
  memberFormData: MemberFormData,
  membershipData: {
    planId: string;
    startDate: Date;
    discountPercent?: number;
    discountAmount?: number;
    gstEnabled: boolean;
  },
  convertedBy: string,
  notes?: string
) => {
  try {
    // 1. Create member record
    const member = convertLeadToMember(lead, memberFormData, convertedBy);

    // 2. Create membership assignment
    const membershipAssignment = createMembershipAssignment(member, membershipData, convertedBy);

    // 3. Create invoice
    const invoice = createMembershipInvoice(membershipAssignment);

    // 4. Update lead status
    const updatedLead = updateLeadToConverted(lead);

    // 5. Create conversion log
    const conversionLog = createConversionLog(lead, member, membershipAssignment, convertedBy, notes);

    // 6. Return all created records for persistence
    return {
      member,
      membershipAssignment,
      invoice,
      updatedLead,
      conversionLog,
    };
  } catch (error) {
    console.error('Error processing lead conversion:', error);
    throw new Error(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
