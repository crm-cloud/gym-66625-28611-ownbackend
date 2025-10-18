
export type FeedbackType = 'facility' | 'trainer' | 'class' | 'equipment' | 'service' | 'general';
export type FeedbackStatus = 'pending' | 'in-review' | 'resolved' | 'closed';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent';
export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export interface Feedback {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  type: FeedbackType;
  category: string;
  title: string;
  description: string;
  rating: FeedbackRating;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  branchId: string;
  branchName: string;
  relatedEntityId?: string; // trainer ID, class ID, equipment ID etc.
  relatedEntityName?: string;
  attachments?: string[];
  tags: string[];
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  adminResponse?: string;
}

export interface FeedbackResponse {
  id: string;
  feedbackId: string;
  responderId: string;
  responderName: string;
  responderRole: 'admin' | 'manager' | 'staff';
  message: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface FeedbackFilters {
  type?: FeedbackType;
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  branchId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  rating?: FeedbackRating;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  closed: number;
  averageRating: number;
  averageResolutionTime: number; // in hours
  byType: Record<FeedbackType, number>;
  byPriority: Record<FeedbackPriority, number>;
}
