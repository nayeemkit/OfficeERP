export interface ProjectResponse {
  id: string; name: string; description: string;
  startDate: string | null; endDate: string | null;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ownerId: string | null; ownerName: string | null; progress: number;
  taskCount: number; completedTasks: number; milestoneCount: number; completedMilestones: number;
  createdAt: string;
}
export interface ProjectRequest {
  name: string; description?: string; startDate?: string; endDate?: string;
  status?: string; priority?: string; ownerId?: string;
}
export interface ProjectStats { totalProjects: number; planning: number; inProgress: number; completed: number; onHold: number; }

export interface TaskResponse {
  id: string; projectId: string; projectName: string; title: string; description: string;
  assigneeId: string | null; assigneeName: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  dueDate: string | null; estimatedHours: number | null; actualHours: number | null; createdAt: string;
}
export interface TaskRequest {
  projectId: string; title: string; description?: string; assigneeId?: string;
  priority?: string; status?: string; dueDate?: string; estimatedHours?: number; actualHours?: number;
}

export interface MilestoneResponse {
  id: string; projectId: string; name: string; description: string;
  targetDate: string; completedDate: string | null; isCompleted: boolean;
}
export interface MilestoneRequest { projectId: string; name: string; description?: string; targetDate: string; }
