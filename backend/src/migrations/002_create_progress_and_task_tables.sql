-- Member Progress Photos Table
CREATE TABLE IF NOT EXISTS member_progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type VARCHAR(20) CHECK (photo_type IN ('front', 'back', 'side', 'other')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_member_progress_photos_member_id ON member_progress_photos(member_id);
CREATE INDEX idx_member_progress_photos_created_at ON member_progress_photos(created_at DESC);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) CHECK (task_type IN ('maintenance', 'cleaning', 'equipment', 'member_support', 'admin', 'other')),
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- in minutes
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  completion_notes TEXT,
  attachments TEXT[], -- array of file URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_branch_id ON tasks(branch_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Task Comments Table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_created_at ON task_comments(created_at ASC);
