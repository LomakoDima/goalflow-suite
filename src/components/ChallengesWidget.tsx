import { useEffect, useMemo, useState } from "react";
import { useTodo } from "@/stores/TodoContext";
import { Flame, Medal, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  target: number;
  type: "tasks-completed" | "streak" | "pomodoros";
}

interface DailyChallengesState {
  date: string;
  ids: string[];
}

const DAILY_CHALLENGE_COUNT = 3;
const DAILY_CHALLENGES_STORAGE_KEY = "gf-daily-challenges";

const CHALLENGES: ChallengeDefinition[] = [
  {
    id: "tasks-3",
    title: "Task Sprinter",
    description: "Complete 3 tasks in total.",
    target: 3,
    type: "tasks-completed",
  },
  {
    id: "tasks-10",
    title: "Productivity Groove",
    description: "Complete 10 tasks in total.",
    target: 10,
    type: "tasks-completed",
  },
  {
    id: "streak-5",
    title: "Streak Keeper",
    description: "Reach a 5 day streak.",
    target: 5,
    type: "streak",
  },
  {
    id: "streak-10",
    title: "Heatwave",
    description: "Reach a 10 day streak.",
    target: 10,
    type: "streak",
  },
  {
    id: "pomodoro-5",
    title: "Deep Focus",
    description: "Finish 5 pomodoro sessions.",
    target: 5,
    type: "pomodoros",
  },
  {
    id: "pomodoro-15",
    title: "Flow Master",
    description: "Finish 15 pomodoro sessions.",
    target: 15,
    type: "pomodoros",
  },
];

function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ChallengesWidget() {
  const { tasks, streak } = useTodo();

  const [activeIds, setActiveIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const today = getTodayKey();
      const raw = localStorage.getItem(DAILY_CHALLENGES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DailyChallengesState;
        if (parsed.date === today && Array.isArray(parsed.ids) && parsed.ids.length > 0) {
          setActiveIds(parsed.ids);
          return;
        }
      }

      const shuffled = [...CHALLENGES].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, DAILY_CHALLENGE_COUNT).map((c) => c.id);
      const state: DailyChallengesState = { date: today, ids: selected };
      localStorage.setItem(DAILY_CHALLENGES_STORAGE_KEY, JSON.stringify(state));
      setActiveIds(selected);
    } catch {
      setActiveIds(CHALLENGES.slice(0, DAILY_CHALLENGE_COUNT).map((c) => c.id));
    }
  }, []);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed).length;
    const pomodoros = tasks.reduce((sum, t) => sum + (t.pomodorosCompleted || 0), 0);
    return {
      completedTasks,
      pomodoros,
      streakDays: streak.currentStreak,
    };
  }, [tasks, streak.currentStreak]);

  const activeChallenges =
    activeIds.length > 0
      ? CHALLENGES.filter((ch) => activeIds.includes(ch.id))
      : CHALLENGES.slice(0, DAILY_CHALLENGE_COUNT);

  const items = activeChallenges.map((ch) => {
    let current = 0;
    if (ch.type === "tasks-completed") current = stats.completedTasks;
    if (ch.type === "streak") current = stats.streakDays;
    if (ch.type === "pomodoros") current = stats.pomodoros;
    const clamped = Math.min(ch.target, current);
    const progress = (clamped / ch.target) * 100;
    const completed = current >= ch.target;
    return { def: ch, current, progress, completed };
  });

  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar/60 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-orange-500/15 flex items-center justify-center">
            <Medal className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">Challenges</p>
            <p className="text-xs text-muted-foreground">Stay on track with small wins.</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 gap-1">
          <Star className="h-3 w-3 text-yellow-400" />
          {items.filter((i) => i.completed).length}/{items.length} done
        </Badge>
      </div>

      <div className="space-y-2">
        {items.map(({ def, current, progress, completed }) => (
          <div
            key={def.id}
            className="rounded-md border border-sidebar-border/60 bg-background/40 px-2.5 py-2 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Flame className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{def.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{def.description}</p>
                </div>
              </div>
              {completed && (
                <Badge className="text-[9px] px-2 py-0.5 flex-shrink-0">Completed</Badge>
              )}
            </div>
            <div className="space-y-0.5">
              <Progress
                value={progress}
                className="h-1.5 bg-secondary/60 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-400"
              />
              <p className="text-[10px] text-muted-foreground text-right">
                {Math.min(current, def.target)}/{def.target}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

