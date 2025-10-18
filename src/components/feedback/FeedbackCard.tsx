
import { format } from 'date-fns';
import { Star, Clock, Tag, User, MessageSquare, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Feedback } from '@/types/feedback';

interface FeedbackCardProps {
  feedback: Feedback;
  onRespond?: (feedbackId: string) => void;
  onViewDetails?: (feedbackId: string) => void;
  showActions?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'destructive';
    case 'in-review': return 'default';
    case 'resolved': return 'secondary';
    case 'closed': return 'outline';
    default: return 'outline';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'outline';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'facility': return '🏢';
    case 'trainer': return '💪';
    case 'class': return '🧘';
    case 'equipment': return '🏋️';
    case 'service': return '🤝';
    default: return '💬';
  }
};

export const FeedbackCard = ({ 
  feedback, 
  onRespond, 
  onViewDetails, 
  showActions = false 
}: FeedbackCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getTypeIcon(feedback.type)}</div>
            <div>
              <CardTitle className="text-lg">{feedback.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3" />
                {format(feedback.createdAt, 'MMM dd, yyyy')}
                {feedback.branchName && (
                  <>
                    <span>•</span>
                    <span>{feedback.branchName}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(feedback.status)}>
              {feedback.status}
            </Badge>
            <Badge variant={getPriorityColor(feedback.priority)}>
              {feedback.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= feedback.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {feedback.rating}/5 stars
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {feedback.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!feedback.isAnonymous ? (
              <>
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {feedback.memberName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{feedback.memberName}</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Anonymous</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {feedback.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {feedback.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{feedback.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>

        {feedback.relatedEntityName && (
          <div className="text-sm text-muted-foreground">
            <strong>Related to:</strong> {feedback.relatedEntityName}
          </div>
        )}

        {feedback.adminResponse && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">Admin Response</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {feedback.adminResponse}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex items-center gap-2 pt-2">
            {onRespond && feedback.status !== 'resolved' && feedback.status !== 'closed' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onRespond(feedback.id)}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Respond
              </Button>
            )}
            {onViewDetails && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onViewDetails(feedback.id)}
              >
                View Details
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
