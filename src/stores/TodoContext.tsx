import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Task, Goal, Category, SubTask, DEFAULT_CATEGORIES } from '@/types/todo';

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

interface TodoContextType {
  tasks: Task[];
  goals: Goal[];
  categories: Category[];
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'pomodorosCompleted' | 'subtasks' | 'completed'> & { subtasks?: SubTask[] }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  incrementPomodoro: (taskId: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'progress'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
}

const TodoContext = createContext<TodoContextType | null>(null);

export function useTodo() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodo must be used within TodoProvider');
  return ctx;
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('todo-tasks', []));
  const [goals, setGoals] = useState<Goal[]>(() => loadFromStorage('todo-goals', []));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('todo-categories', DEFAULT_CATEGORIES));
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => saveToStorage('todo-tasks', tasks), [tasks]);
  useEffect(() => saveToStorage('todo-goals', goals), [goals]);
  useEffect(() => saveToStorage('todo-categories', categories), [categories]);

  // Recalculate goal progress whenever tasks change
  useEffect(() => {
    setGoals(prev => prev.map(goal => {
      const goalTasks = tasks.filter(t => t.goalId === goal.id);
      const progress = goalTasks.length === 0 ? 0 : Math.round((goalTasks.filter(t => t.completed).length / goalTasks.length) * 100);
      return { ...goal, progress };
    }));
  }, [tasks]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'pomodorosCompleted' | 'subtasks' | 'completed'> & { subtasks?: SubTask[] }) => {
    setTasks(prev => [...prev, {
      ...task,
      id: generateId(),
      completed: false,
      pomodorosCompleted: 0,
      subtasks: task.subtasks || [],
      createdAt: new Date().toISOString(),
    }]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
    } : t));
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      subtasks: [...t.subtasks, { id: generateId(), title, completed: false }]
    } : t));
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      subtasks: t.subtasks.filter(s => s.id !== subtaskId)
    } : t));
  }, []);

  const incrementPomodoro = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, pomodorosCompleted: t.pomodorosCompleted + 1 } : t));
  }, []);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'progress'>) => {
    setGoals(prev => [...prev, { ...goal, id: generateId(), progress: 0, createdAt: new Date().toISOString() }]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    setTasks(prev => prev.map(t => t.goalId === id ? { ...t, goalId: undefined } : t));
  }, []);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: generateId() }]);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <TodoContext.Provider value={{
      tasks, goals, categories, selectedCategoryId, setSelectedCategoryId,
      addTask, updateTask, deleteTask, toggleTask, toggleSubtask, addSubtask, deleteSubtask, incrementPomodoro,
      addGoal, updateGoal, deleteGoal, addCategory, deleteCategory,
    }}>
      {children}
    </TodoContext.Provider>
  );
}
