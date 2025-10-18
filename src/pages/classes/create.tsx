
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react';
import { ClassFormData, ClassTag } from '@/types/class';
import { toast } from '@/components/ui/use-toast';

const classTagOptions: { value: ClassTag; label: string; color: string }[] = [
  { value: 'strength', label: 'Strength Training', color: 'bg-red-100 text-red-800' },
  { value: 'cardio', label: 'Cardio', color: 'bg-orange-100 text-orange-800' },
  { value: 'flexibility', label: 'Flexibility', color: 'bg-green-100 text-green-800' },
  { value: 'dance', label: 'Dance', color: 'bg-purple-100 text-purple-800' },
  { value: 'martial-arts', label: 'Martial Arts', color: 'bg-blue-100 text-blue-800' },
  { value: 'water', label: 'Water Sports', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'mind-body', label: 'Mind-Body', color: 'bg-indigo-100 text-indigo-800' }
];

export function ClassCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<ClassFormData>>({
    name: '',
    description: '',
    capacity: 20,
    tags: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call
    toast({
      title: "Class Created",
      description: "The class has been successfully created and scheduled.",
    });
    
    navigate('/classes');
  };

  const toggleTag = (tag: ClassTag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Class</h1>
          <p className="text-muted-foreground">Schedule a new fitness class for members</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/classes')}>
          Back to Classes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Class Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Morning Yoga Flow"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  min="1"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the class, its benefits, and what participants can expect..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Class Tags</Label>
              <div className="flex flex-wrap gap-2">
                {classTagOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={formData.tags?.includes(option.value) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleTag(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Trainer</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trainer1">Mike Rodriguez</SelectItem>
                    <SelectItem value="trainer2">Sarah Wilson</SelectItem>
                    <SelectItem value="trainer3">David Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Branch</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch1">Downtown Branch</SelectItem>
                    <SelectItem value="branch2">Uptown Branch</SelectItem>
                    <SelectItem value="branch3">Westside Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recurrence</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Create Class
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/classes')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
