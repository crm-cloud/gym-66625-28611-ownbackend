
import { useState } from 'react';
import { FeedbackCard } from './FeedbackCard';
import { FeedbackFilters } from './FeedbackFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Feedback, FeedbackFilters as FeedbackFiltersType } from '@/types/feedback';

interface FeedbackListProps {
  feedbacks: Feedback[];
  onRespond?: (feedbackId: string) => void;
  onViewDetails?: (feedbackId: string) => void;
  showActions?: boolean;
  title?: string;
  description?: string;
}

export const FeedbackList = ({ 
  feedbacks, 
  onRespond, 
  onViewDetails, 
  showActions = false,
  title = "Feedback",
  description = "Recent feedback from members"
}: FeedbackListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FeedbackFiltersType>({});

  const filteredFeedbacks = feedbacks.filter(feedback => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !feedback.title.toLowerCase().includes(query) &&
        !feedback.description.toLowerCase().includes(query) &&
        !feedback.memberName.toLowerCase().includes(query) &&
        !feedback.category.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Type filter
    if (filters.type && feedback.type !== filters.type) {
      return false;
    }

    // Status filter
    if (filters.status && feedback.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority && feedback.priority !== filters.priority) {
      return false;
    }

    // Rating filter
    if (filters.rating && feedback.rating !== filters.rating) {
      return false;
    }

    // Branch filter
    if (filters.branchId && feedback.branchId !== filters.branchId) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mb-6">
              <FeedbackFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((feedback) => (
                <FeedbackCard
                  key={feedback.id}
                  feedback={feedback}
                  onRespond={onRespond}
                  onViewDetails={onViewDetails}
                  showActions={showActions}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {searchQuery || Object.keys(filters).length > 0 
                  ? 'No feedback matches your search criteria.'
                  : 'No feedback available.'
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
