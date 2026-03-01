import { useState } from 'react';
import { TodoProvider, useTodo } from '@/stores/TodoContext';
import { AppSidebar } from '@/components/AppSidebar';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { TaskItem } from '@/components/TaskItem';
import { GoalCard } from '@/components/GoalCard';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { AddGoalDialog } from '@/components/AddGoalDialog';
import { ListFilter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function MainContent() {
  const { tasks, goals, selectedCategoryId } = useTodo();
  const [activeView, setActiveView] = useState<'tasks' | 'goals'>('tasks');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'created'>('priority');

  const filteredTasks = tasks.filter(t => {
    if (selectedCategoryId && t.categoryId !== selectedCategoryId) return false;
    if (activeView === 'tasks' && t.goalId) return true; // show all in task view
    return true;
  });

  const standaloneTasks = filteredTasks.filter(t => !t.goalId);
  const filteredGoals = goals.filter(g => {
    if (selectedCategoryId && g.categoryId !== selectedCategoryId) return false;
    return true;
  });

  const sortedTasks = [...standaloneTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    }
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                {activeView === 'tasks' ? 'Задачи' : 'Цели'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeView === 'tasks'
                  ? `${standaloneTasks.filter(t => !t.completed).length} активных задач`
                  : `${filteredGoals.length} целей`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeView === 'tasks' && (
                <div className="flex items-center gap-1.5">
                  <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
                    <SelectTrigger className="h-8 w-32 text-xs bg-secondary border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">По приоритету</SelectItem>
                      <SelectItem value="deadline">По дедлайну</SelectItem>
                      <SelectItem value="created">По дате</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <AddTaskDialog />
              <AddGoalDialog />
            </div>
          </div>

          {/* Content */}
          {activeView === 'tasks' ? (
            <div className="space-y-2">
              {sortedTasks.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-sm">Нет задач. Создайте первую!</p>
                </div>
              )}
              {sortedTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGoals.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-sm">Нет целей. Создайте первую!</p>
                </div>
              )}
              {filteredGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Pomodoro */}
        <div className="w-72 border-l border-border p-4 overflow-y-auto scrollbar-thin hidden lg:block">
          <PomodoroTimer />
        </div>
      </div>
    </div>
  );
}

const Index = () => (
  <TodoProvider>
    <MainContent />
  </TodoProvider>
);

export default Index;
