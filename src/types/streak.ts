export interface StreakState {
  /** Last calendar day (YYYY-MM-DD) when user completed at least one task */
  lastActivityDate: string | null;
  /** Current consecutive days streak */
  currentStreak: number;
  /** Longest streak ever */
  longestStreak: number;
  /** Dates (YYYY-MM-DD) when user had activity, for heatmap (last 90 days) */
  activityDates: string[];
  /** Number of freezes used in current week (Monday–Sunday) */
  freezesUsedThisWeek: number;
  /** Monday (YYYY-MM-DD) of the week when freezes were last reset */
  freezesWeekStart: string | null;
}

export const DEFAULT_STREAK_STATE: StreakState = {
  lastActivityDate: null,
  currentStreak: 0,
  longestStreak: 0,
  activityDates: [],
  freezesUsedThisWeek: 0,
  freezesWeekStart: null,
};

const STREAK_STORAGE_KEY = 'todo-streak';
const MAX_FREEZES_PER_WEEK = 1;

/** Get today's date in local timezone as YYYY-MM-DD */
export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Get Monday of the week for the given date (YYYY-MM-DD) */
export function getWeekStart(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 0
  date.setDate(date.getDate() + diff);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** Add one day to YYYY-MM-DD */
function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** Difference in calendar days (dateKey1 - dateKey2) */
function daysDiff(dateKey1: string, dateKey2: string): number {
  const d1 = new Date(dateKey1);
  const d2 = new Date(dateKey2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d1.getTime() - d2.getTime()) / (24 * 60 * 60 * 1000));
}

export function loadStreakFromStorage(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STREAK_STATE };
    const parsed = JSON.parse(raw) as Partial<StreakState>;
    return {
      lastActivityDate: parsed.lastActivityDate ?? null,
      currentStreak: Math.max(0, Number(parsed.currentStreak) || 0),
      longestStreak: Math.max(0, Number(parsed.longestStreak) || 0),
      activityDates: Array.isArray(parsed.activityDates) ? parsed.activityDates : [],
      freezesUsedThisWeek: Math.max(0, Number(parsed.freezesUsedThisWeek) || 0),
      freezesWeekStart: parsed.freezesWeekStart ?? null,
    };
  } catch {
    return { ...DEFAULT_STREAK_STATE };
  }
}

export function saveStreakToStorage(state: StreakState): void {
  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(state));
}

/** Compute next streak state when user completes at least one task today */
export function recordActivity(prev: StreakState): StreakState {
  const today = getTodayDateKey();
  const weekStart = getWeekStart(today);

  // Reset freezes if new week
  let freezesUsedThisWeek = prev.freezesUsedThisWeek;
  let freezesWeekStart = prev.freezesWeekStart;
  if (prev.freezesWeekStart !== weekStart) {
    freezesUsedThisWeek = 0;
    freezesWeekStart = weekStart;
  }

  const last = prev.lastActivityDate;
  let currentStreak = prev.currentStreak;
  let longestStreak = prev.longestStreak;

  if (!last) {
    currentStreak = 1;
  } else if (last === today) {
    // Already counted today, no change
  } else {
    const diff = daysDiff(today, last);
    if (diff === 1) {
      currentStreak += 1;
    } else if (diff > 1) {
      const freezesAvailable = MAX_FREEZES_PER_WEEK - freezesUsedThisWeek;
      if (diff === 2 && freezesAvailable > 0) {
        freezesUsedThisWeek += 1;
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  const activityDates = [...prev.activityDates];
  if (!activityDates.includes(today)) {
    activityDates.push(today);
    activityDates.sort();
    const keep = activityDates.slice(-90);
    return {
      lastActivityDate: today,
      currentStreak,
      longestStreak,
      activityDates: keep,
      freezesUsedThisWeek,
      freezesWeekStart,
    };
  }

  return {
    ...prev,
    lastActivityDate: today,
    currentStreak,
    longestStreak,
    freezesUsedThisWeek,
    freezesWeekStart,
  };
}

/** Use a streak freeze for yesterday (so streak doesn't break). Returns new state or null if not allowed */
export function useStreakFreeze(prev: StreakState): StreakState | null {
  const today = getTodayDateKey();
  const yesterday = addDays(today, -1);
  const weekStart = getWeekStart(today);

  let freezesUsedThisWeek = prev.freezesUsedThisWeek;
  let freezesWeekStart = prev.freezesWeekStart;
  if (prev.freezesWeekStart !== weekStart) {
    freezesUsedThisWeek = 0;
    freezesWeekStart = weekStart;
  }

  if (freezesUsedThisWeek >= MAX_FREEZES_PER_WEEK) return null;
  const last = prev.lastActivityDate;
  if (!last) return null;
  const diff = daysDiff(today, last);
  if (diff !== 2) return null; // Only use freeze when we missed exactly one day (yesterday)

  freezesUsedThisWeek += 1;
  // Freeze fills in yesterday so streak continues when they complete today; don't increment streak yet
  const activityDates = [...prev.activityDates];
  if (!activityDates.includes(yesterday)) activityDates.push(yesterday);
  activityDates.sort();
  const keep = activityDates.slice(-90);

  return {
    lastActivityDate: yesterday,
    currentStreak: prev.currentStreak,
    longestStreak: prev.longestStreak,
    activityDates: keep,
    freezesUsedThisWeek,
    freezesWeekStart,
  };
}

/** Whether user can use a freeze right now (last activity was 2 days ago = missed yesterday, has freezes left) */
export function canUseStreakFreeze(state: StreakState): boolean {
  const today = getTodayDateKey();
  const weekStart = getWeekStart(today);
  let freezesUsed = state.freezesUsedThisWeek;
  if (state.freezesWeekStart !== weekStart) freezesUsed = 0;
  if (freezesUsed >= MAX_FREEZES_PER_WEEK) return false;
  const last = state.lastActivityDate;
  if (!last) return false;
  return daysDiff(today, last) === 2;
}

/** Get list of date keys for the last N days (including today) */
export function getLastNDays(n: number): string[] {
  const today = getTodayDateKey();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(addDays(today, -i));
  }
  return out;
}

/** Duolingo-style streak level thresholds (days): 0, 1-2, 3-6, 7-13, 14-29, 30-99, 100+ */
const STREAK_LEVEL_THRESHOLDS = [0, 1, 3, 7, 14, 30, 100];

export interface StreakLevelInfo {
  level: number;
  label: string;
  daysInLevel: number;
  daysToNextLevel: number;
  progress: number; // 0–1 within current level
}

export function getStreakLevelInfo(currentStreak: number): StreakLevelInfo {
  if (currentStreak <= 0) {
    return { level: 0, label: 'Start', daysInLevel: 0, daysToNextLevel: 1, progress: 0 };
  }
  let level = 0;
  for (let i = STREAK_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (currentStreak >= STREAK_LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  const levelStart = STREAK_LEVEL_THRESHOLDS[level];
  const levelEnd = STREAK_LEVEL_THRESHOLDS[level + 1] ?? levelStart + 100;
  const daysInLevel = currentStreak - levelStart;
  const daysToNextLevel = levelEnd - levelStart;
  const progress = daysToNextLevel > 0 ? Math.min(1, daysInLevel / daysToNextLevel) : 1;
  const labels = ['Start', 'Flame', 'Blaze', 'Inferno', 'Legend', 'Master', 'Eternal'];
  return {
    level,
    label: labels[level] ?? 'Eternal',
    daysInLevel,
    daysToNextLevel,
    progress,
  };
}
