import { useState, useEffect, useCallback, useRef } from 'react';
import { PomodoroMode, POMODORO_DURATIONS } from '@/types/todo';
import { useTodo } from '@/stores/TodoContext';
import { Play, Pause, RotateCcw, SkipForward, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function PomodoroTimer() {
  const { tasks, incrementPomodoro } = useTodo();
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATIONS['work']);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessions] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const incompleteTasks = tasks.filter(t => !t.completed);

  const switchMode = useCallback((newMode: PomodoroMode) => {
    setMode(newMode);
    setTimeLeft(POMODORO_DURATIONS[newMode]);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (mode === 'work') {
            const newSessions = sessionsCompleted + 1;
            setSessions(newSessions);
            if (activeTaskId) incrementPomodoro(activeTaskId);
            // Auto switch to break
            const nextMode = newSessions % 4 === 0 ? 'long-break' : 'short-break';
            setTimeout(() => switchMode(nextMode), 100);
          } else {
            setTimeout(() => switchMode('work'), 100);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode, sessionsCompleted, activeTaskId, incrementPomodoro, switchMode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / POMODORO_DURATIONS[mode];

  const isWork = mode === 'work';
  const circumference = 2 * Math.PI * 54;

  return (
    <div className={cn(
      "rounded-xl border p-6 transition-all duration-500",
      isWork ? "border-pomodoro/20 bg-card" : "border-pomodoro-break/20 bg-card",
      isRunning && isWork && "glow-pomodoro"
    )}>
      <div className="flex items-center gap-2 mb-4">
        <Timer className={cn("h-4 w-4", isWork ? "text-pomodoro" : "text-pomodoro-break")} />
        <h3 className="font-display font-semibold text-sm text-foreground">Pomodoro</h3>
        <span className="ml-auto text-xs text-muted-foreground">{sessionsCompleted} sessions</span>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 mb-5 bg-secondary rounded-lg p-1">
        {(['work', 'short-break', 'long-break'] as PomodoroMode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "flex-1 text-xs py-1.5 rounded-md transition-all font-medium",
              mode === m
                ? (m === 'work' ? "bg-pomodoro text-primary-foreground" : "bg-pomodoro-break text-primary-foreground")
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === 'work' ? 'Work' : m === 'short-break' ? 'Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="flex justify-center mb-5">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={isWork ? "hsl(var(--pomodoro))" : "hsl(var(--pomodoro-break))"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "font-display text-3xl font-bold tabular-nums",
              isRunning && "animate-timer-tick"
            )}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2 mb-4">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => switchMode(mode)}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full",
            isWork
              ? "bg-pomodoro hover:bg-pomodoro/90 text-primary-foreground"
              : "bg-pomodoro-break hover:bg-pomodoro-break/90 text-primary-foreground"
          )}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => {
            const nextMode = mode === 'work' ? 'short-break' : 'work';
            switchMode(nextMode);
          }}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Task Selector */}
      {isWork && (
        <Select value={activeTaskId || ''} onValueChange={v => setActiveTaskId(v || null)}>
          <SelectTrigger className="h-8 text-xs bg-secondary border-0">
            <SelectValue placeholder="Link to a task..." />
          </SelectTrigger>
          <SelectContent>
            {incompleteTasks.map(t => (
              <SelectItem key={t.id} value={t.id} className="text-xs">{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
