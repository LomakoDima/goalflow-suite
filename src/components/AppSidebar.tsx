import { useTodo } from '@/stores/TodoContext';
import { Target, FolderOpen, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreakWidget } from '@/components/StreakWidget';
import { ChallengesWidget } from '@/components/ChallengesWidget';

interface AppSidebarProps {
  activeView: 'tasks' | 'goals';
  setActiveView: (v: 'tasks' | 'goals') => void;
}

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  const { categories, selectedCategoryId, setSelectedCategoryId, goals, tasks } = useTodo();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="font-display text-lg font-bold text-foreground tracking-tight">
          Focus<span className="text-primary">Flow</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {completedTasks}/{totalTasks} tasks completed
        </p>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        <button
          onClick={() => setActiveView('tasks')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeView === 'tasks'
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Tasks
        </button>
        <button
          onClick={() => setActiveView('goals')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeView === 'goals'
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <Target className="h-4 w-4" />
          Goals
          {goals.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">{goals.length}</span>
          )}
        </button>
      </nav>

      {/* Categories */}
      <div className="px-3 mt-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Categories
        </h3>
        <div className="space-y-0.5">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
              selectedCategoryId === null
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <FolderOpen className="h-4 w-4" />
            All
          </button>
          {categories.map(cat => {
            const count = tasks.filter(t => t.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                  selectedCategoryId === cat.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `hsl(${cat.color})` }}
                />
                {cat.name}
                {count > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 space-y-3">
        <StreakWidget />
        <ChallengesWidget />
      </div>

      <div className="mt-auto p-3 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground text-center">FocusFlow v1.0</p>
      </div>
    </div>
  );
}
