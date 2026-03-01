export type Priority = 'high' | 'medium' | 'low';
export type PomodoroMode = 'work' | 'short-break' | 'long-break';

export interface Category {
  id: string;
  name: string;
  color: string; // HSL string like "35 90% 55%"
  icon?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  deadline?: string; // ISO date string
  categoryId?: string;
  goalId?: string;
  subtasks: SubTask[];
  pomodorosCompleted: number;
  pomodorosEstimated: number;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  progress: number; // 0-100, calculated from tasks
  createdAt: string;
}

export interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number; // seconds
  isRunning: boolean;
  sessionsCompleted: number;
  activeTaskId: string | null;
}

export const POMODORO_DURATIONS: Record<PomodoroMode, number> = {
  'work': 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '220 70% 55%' },
  { id: 'personal', name: 'Personal', color: '280 65% 55%' },
  { id: 'study', name: 'Study', color: '160 60% 45%' },
  { id: 'health', name: 'Health', color: '0 72% 55%' },
];
