import { useTodo } from '@/stores/TodoContext';
import { Goal } from '@/types/todo';
import { TaskItem } from './TaskItem';
import { Target, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

export function GoalCard({ goal }: { goal: Goal }) {
  const { tasks, deleteGoal, categories } = useTodo();
  const [expanded, setExpanded] = useState(true);
  const goalTasks = tasks.filter(t => t.goalId === goal.id);
  const category = categories.find(c => c.id === goal.categoryId);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Target className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display font-semibold text-sm text-foreground">{goal.title}</h3>
            {category && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                style={{
                  backgroundColor: `hsl(${category.color} / 0.15)`,
                  color: `hsl(${category.color})`,
                }}
              >
                {category.name}
              </span>
            )}
          </div>
          {goal.description && (
            <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <Progress value={goal.progress} className="h-1.5 flex-1" />
            <span className="text-xs font-medium text-muted-foreground">{goal.progress}%</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <button
            onClick={() => deleteGoal(goal.id)}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded && goalTasks.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          {goalTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}

      {expanded && goalTasks.length === 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground text-center py-3">
            No tasks yet. Create a task and link it to this goal.
          </p>
        </div>
      )}
    </div>
  );
}
