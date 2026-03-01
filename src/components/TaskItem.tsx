import { useState } from 'react';
import { Task, SubTask } from '@/types/todo';
import { useTodo } from '@/stores/TodoContext';
import { cn } from '@/lib/utils';
import {
  Check, ChevronDown, ChevronRight, Clock, Flame, Trash2, Plus, X
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { ru } from 'date-fns/locale';

const priorityConfig = {
  high: { label: 'Высокий', class: 'text-priority-high', dot: 'bg-priority-high' },
  medium: { label: 'Средний', class: 'text-priority-medium', dot: 'bg-priority-medium' },
  low: { label: 'Низкий', class: 'text-priority-low', dot: 'bg-priority-low' },
};

export function TaskItem({ task }: { task: Task }) {
  const { toggleTask, deleteTask, toggleSubtask, addSubtask, deleteSubtask, categories } = useTodo();
  const [expanded, setExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const category = categories.find(c => c.id === task.categoryId);
  const prio = priorityConfig[task.priority];

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadlineDate && isPast(deadlineDate) && !task.completed;

  const formatDeadline = () => {
    if (!deadlineDate) return null;
    if (isToday(deadlineDate)) return `Сегодня, ${format(deadlineDate, 'HH:mm')}`;
    if (isTomorrow(deadlineDate)) return `Завтра, ${format(deadlineDate, 'HH:mm')}`;
    return format(deadlineDate, 'd MMM, HH:mm', { locale: ru });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  return (
    <div className={cn(
      "group rounded-lg border transition-all duration-200 hover:border-primary/20",
      task.completed ? "border-border/50 opacity-60" : "border-border bg-card",
    )}>
      <div className="flex items-start gap-3 p-3">
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className={cn(
            "mt-0.5 flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all",
            task.completed
              ? "bg-success border-success"
              : `border-muted-foreground/30 hover:border-primary`
          )}
        >
          {task.completed && <Check className="h-3 w-3 text-primary-foreground" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium transition-all",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </span>
            <div className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", prio.dot)} />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
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
            {deadlineDate && (
              <span className={cn(
                "flex items-center gap-1 text-[10px]",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}>
                <Clock className="h-3 w-3" />
                {formatDeadline()}
              </span>
            )}
            {task.pomodorosCompleted > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-pomodoro">
                <Flame className="h-3 w-3" />
                {task.pomodorosCompleted}/{task.pomodorosEstimated || '?'}
              </span>
            )}
            {task.subtasks.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {completedSubtasks}/{task.subtasks.length}
              </button>
            )}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => deleteTask(task.id)}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Subtasks */}
      {(expanded || (task.subtasks.length === 0 && false)) && (
        <div className="px-3 pb-3 pl-11 space-y-1.5">
          {task.subtasks.map(sub => (
            <div key={sub.id} className="flex items-center gap-2 group/sub">
              <button
                onClick={() => toggleSubtask(task.id, sub.id)}
                className={cn(
                  "h-4 w-4 rounded border flex items-center justify-center transition-all flex-shrink-0",
                  sub.completed
                    ? "bg-success/80 border-success/80"
                    : "border-muted-foreground/30 hover:border-primary"
                )}
              >
                {sub.completed && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
              </button>
              <span className={cn(
                "text-xs",
                sub.completed && "line-through text-muted-foreground"
              )}>
                {sub.title}
              </span>
              <button
                onClick={() => deleteSubtask(task.id, sub.id)}
                className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-destructive ml-auto"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {/* Add subtask inline */}
          <div className="flex items-center gap-2 mt-1">
            <Plus className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
              placeholder="Добавить подзадачу..."
              className="text-xs bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full"
            />
          </div>
        </div>
      )}

      {/* Expand toggle for tasks with subtasks when collapsed */}
      {!expanded && task.subtasks.length > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full px-3 pb-2 flex justify-center"
        >
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
