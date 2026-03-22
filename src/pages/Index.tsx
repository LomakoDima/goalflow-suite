import { useState } from 'react';
import { TodoProvider, useTodo } from '@/stores/TodoContext';
import { AppSidebar } from '@/components/AppSidebar';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { TaskItem } from '@/components/TaskItem';
import { GoalCard } from '@/components/GoalCard';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { AddGoalDialog } from '@/components/AddGoalDialog';
import { ListFilter, Menu, Timer } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

function MainContent() {
  const { tasks, goals, selectedCategoryId } = useTodo();
  const [activeView, setActiveView] = useState<'tasks' | 'goals'>('tasks');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'created'>('priority');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pomoSheetOpen, setPomoSheetOpen] = useState(false);

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
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/80 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-full w-[min(18rem,85vw)] shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar scrollbar-thin transition-transform duration-300 ease-out',
          'md:relative md:z-0 md:h-full md:w-72 md:translate-x-0 md:transition-none',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <AppSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onNavigate={() => setMobileNavOpen(false)}
        />
      </aside>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">FocusFlow</p>
            <h2 className="font-display truncate text-lg font-bold leading-tight text-foreground">
              {activeView === 'tasks' ? 'Tasks' : 'Goals'}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {activeView === 'tasks'
                ? `${standaloneTasks.filter(t => !t.completed).length} active tasks`
                : `${filteredGoals.length} goals`}
            </p>
          </div>
          <Sheet open={pomoSheetOpen} onOpenChange={setPomoSheetOpen}>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" size="icon" className="shrink-0" aria-label="Pomodoro">
                <Timer className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[min(90vh,560px)] overflow-y-auto rounded-t-2xl p-4 sm:p-6">
              <PomodoroTimer />
            </SheetContent>
          </Sheet>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 hidden md:block">
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                {activeView === 'tasks' ? 'Tasks' : 'Goals'}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {activeView === 'tasks'
                  ? `${standaloneTasks.filter(t => !t.completed).length} active tasks`
                  : `${filteredGoals.length} goals`
                }
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activeView === 'tasks' && (
                <div className="flex min-w-0 items-center gap-1.5">
                  <ListFilter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
                    <SelectTrigger className="h-8 w-full min-w-[7.5rem] max-w-[10rem] text-xs bg-secondary border-0 sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">By Priority</SelectItem>
                      <SelectItem value="deadline">By Deadline</SelectItem>
                      <SelectItem value="created">By Date</SelectItem>
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
                  <p className="text-muted-foreground text-sm">No tasks yet. Create your first one!</p>
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
                  <p className="text-muted-foreground text-sm">No goals yet. Create your first one!</p>
                </div>
              )}
              {filteredGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
          </div>

          <div className="hidden w-72 shrink-0 overflow-y-auto border-l border-border p-4 scrollbar-thin lg:block">
            <PomodoroTimer />
          </div>
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
