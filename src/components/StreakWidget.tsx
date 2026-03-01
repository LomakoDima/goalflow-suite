import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTodo } from '@/stores/TodoContext';
import { getLastNDays, canUseStreakFreeze, getStreakLevelInfo } from '@/types/streak';
import { Flame, Snowflake, Trophy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CONFETTI_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fbbf24', '#facc15', '#22c55e', '#38bdf8', '#a855f7', '#ec4899'];
const CONFETTI_COUNT = 50;

const FIRE_PARTICLE_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fbbf24', '#facc15'];
const FIRE_PARTICLE_COUNT = 16;

const STREAK_PHRASES: Record<number, string[]> = {
  1: [
    "A spark! The fire is coming.",
    "Day one — like a first kiss. But with tasks.",
    "One day is not zero. Math is on your side.",
  ],
  2: [
    "Two days in a row! Who are you, a superhero?",
    "Two's not a grade, it's a trend.",
  ],
  3: [
    "Three days! The rule of three works.",
    "Three is a magic number. So is your streak.",
  ],
  7: [
    "A full week! You did what others only dream of.",
    "7 days. That's how long it took to create the world. You're almost there.",
  ],
  14: [
    "Two weeks! We were about to send you a postcard.",
    "14 days. The calendar is crying with pride.",
  ],
  30: [
    "A month! They should put you in the productivity hall of fame.",
    "30 days. Even Duolingo would cry.",
  ],
  100: [
    "100 days. One hundred. We're speechless.",
    "You're either a robot or a legend. We're going with legend.",
  ],
};

const DEFAULT_PHRASES = [
  "On fire! Keep it up.",
  "The streak grows, and so does our respect.",
  "Every day is a small victory.",
  "We'd wink, but we're text.",
];

function getStreakPhrase(days: number): string {
  const keys = Object.keys(STREAK_PHRASES)
    .map(Number)
    .filter((k) => days >= k)
    .sort((a, b) => b - a);
  const key = keys[0];
  const phrases = key != null ? STREAK_PHRASES[key] : DEFAULT_PHRASES;
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function StreakWidget() {
  const { streak, useStreakFreeze } = useTodo();
  const { toast } = useToast();
  const last7 = getLastNDays(7);
  const canFreeze = canUseStreakFreeze(streak);
  const levelInfo = getStreakLevelInfo(streak.currentStreak);

  const prevStreakRef = useRef(streak.currentStreak);
  const prevLevelRef = useRef(levelInfo.level);
  const [animatePop, setAnimatePop] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const celebrationRef = useRef<{ streak: number; phrase: string } | null>(null);

  useEffect(() => {
    const prevStreak = prevStreakRef.current;
    const prevLevel = prevLevelRef.current;
    if (streak.currentStreak > prevStreak && prevStreak >= 0) {
      setAnimatePop(true);
      celebrationRef.current = {
        streak: streak.currentStreak,
        phrase: getStreakPhrase(streak.currentStreak),
      };
      setShowFullScreen(true);
      setShowConfetti(true);
      const t = setTimeout(() => setAnimatePop(false), 650);
      const t2 = setTimeout(() => setShowFullScreen(false), 2200);
      const t3 = setTimeout(() => setShowConfetti(false), 2000);
      const t4 = setTimeout(() => {
        prevStreakRef.current = streak.currentStreak;
        prevLevelRef.current = levelInfo.level;
        celebrationRef.current = null;
      }, 2300);
      return () => { clearTimeout(t); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
    prevStreakRef.current = streak.currentStreak;
    prevLevelRef.current = levelInfo.level;
  }, [streak.currentStreak, levelInfo.level]);

  const handleUseFreeze = () => {
    const applied = useStreakFreeze();
    if (applied) {
      toast({
        title: 'Streak freeze used',
        description: "Yesterday is marked as active. Complete a task today to keep your streak!",
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Cannot use freeze',
        description: 'No freeze available or conditions not met.',
      });
    }
  };

  const hasStreak = streak.currentStreak > 0;

  const fireParticles = useMemo(
    () =>
      Array.from({ length: FIRE_PARTICLE_COUNT }, (_, i) => ({
        left: (i / (FIRE_PARTICLE_COUNT - 1)) * 100,
        delay: (i * 0.25 + Math.random() * 1.5) % 4,
        duration: 2.2 + Math.random() * 1.8,
        size: 2 + (i % 3),
        color: FIRE_PARTICLE_COLORS[i % FIRE_PARTICLE_COLORS.length],
      })),
    []
  );

  const confettiPieces = useRef<{ left: number; delay: number; color: string; size: number }[] | null>(null);
  if (showConfetti && !confettiPieces.current) {
    confettiPieces.current = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 10,
    }));
  }
  if (!showConfetti) confettiPieces.current = null;

  const fullScreenCelebration = (showConfetti || showFullScreen) && typeof document !== 'undefined' && celebrationRef.current && (
    createPortal(
      <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
        {/* Full-screen confetti */}
        {showConfetti && confettiPieces.current && (
          <div className="absolute inset-0 overflow-hidden">
            {confettiPieces.current.map((p, i) => (
              <div
                key={i}
                className="absolute streak-confetti rounded-sm"
                style={{
                  left: `${p.left}%`,
                  top: '-20px',
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  animation: 'streak-confetti-fall-fullscreen 1.8s ease-out forwards',
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
        )}
        {/* Full-screen: innovative flame ignition + X day streak + phrase */}
        {showFullScreen && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-background/92 backdrop-blur-sm"
            style={{ animation: 'streak-overlay-fade 0.3s ease-out forwards' }}
          >
            <div className="text-center px-6 flex flex-col items-center">
              {/* Flame container: ring burst → core glow → sparks → flame icon */}
              <div className="relative mb-4 flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
                {/* Expanding energy ring */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-orange-500/80 w-20 h-20 md:w-24 md:h-24 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ animation: 'streak-flame-ring 0.8s ease-out forwards' }}
                />
                {/* Soft core glow behind flame */}
                <div
                  className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full bg-orange-400/40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ animation: 'streak-flame-core 0.6s ease-out 0.1s forwards' }}
                />
                {/* Burst sparks */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i / 8) * 2 * Math.PI;
                  const r = 52;
                  const x = Math.round(Math.cos(angle) * r);
                  const y = Math.round(Math.sin(angle) * r);
                  return (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 streak-flame-spark"
                      style={
                        {
                          '--spark-x': `${x}px`,
                          '--spark-y': `${y}px`,
                          animation: 'streak-flame-spark 0.5s ease-out 0.2s forwards',
                        } as React.CSSProperties
                      }
                    />
                  );
                })}
                {/* Main flame icon */}
                <div
                  className="relative flex items-center justify-center"
                  style={{ animation: 'streak-flame-ignition 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                >
                  <Flame className="w-24 h-24 md:w-32 md:h-32 text-orange-500 drop-shadow-[0_0_40px_rgba(249,115,22,0.7)]" />
                </div>
              </div>
              <p className="text-4xl md:text-6xl font-bold text-foreground mb-2">
                {celebrationRef.current.streak} day streak
              </p>
              <p className="text-lg md:text-xl text-muted-foreground max-w-md">
                {celebrationRef.current.phrase}
              </p>
            </div>
          </div>
        )}
      </div>,
      document.body
    )
  );

  return (
    <>
      {fullScreenCelebration}
      <div
        className={cn(
          "rounded-lg border bg-sidebar/50 p-3 space-y-3 relative transition-all duration-200",
          hasStreak ? "streak-widget-celebrate overflow-visible" : "border-sidebar-border overflow-hidden"
        )}
      >
        {/* Fire particles falling like rain (only when streak is active) */}
        {hasStreak && (
          <div className="absolute inset-0 pointer-events-none overflow-visible rounded-lg">
            {fireParticles.map((p, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${p.left}%`,
                  top: 0,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  animation: `streak-fire-particle-fall ${p.duration}s linear infinite`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
        )}
      <div className="relative z-10 flex items-center gap-2">
        <div
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-shadow",
            hasStreak ? "streak-flame-volume animate-streak-flame-burn" : "",
            animatePop && "animate-streak-pop streak-glow-ring"
          )}
        >
          <Flame className="h-5 w-5 text-orange-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground leading-tight flex items-baseline gap-1">
            {hasStreak ? (
              <>
                <span className={cn(animatePop && "inline-block animate-streak-number-bounce")}>
                  {streak.currentStreak}
                </span>
                <span>day streak</span>
              </>
            ) : (
              'No streak yet'
            )}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Trophy className="h-2.5 w-2.5" />
              Best: {streak.longestStreak}
            </span>
            {levelInfo.level > 0 && (
              <span className="text-[10px] text-orange-500/90 font-medium">
                Lv.{levelInfo.level} {levelInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Level progress bar (Duolingo-style) */}
      {levelInfo.level > 0 && levelInfo.level < 6 && (
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500 ease-out"
              style={{ width: `${levelInfo.progress * 100}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground text-right">
            {levelInfo.daysInLevel}/{levelInfo.daysToNextLevel} to Lv.{levelInfo.level + 1}
          </p>
        </div>
      )}

      {/* Last 7 days — entrance animation only for filled (streak) circles */}
      <div className="flex items-center justify-between gap-0.5">
        {last7.map((dateKey, i) => {
          const active = streak.activityDates.includes(dateKey);
          const date = parseISO(dateKey);
          const dayLabel = format(date, 'd');
          const fullLabel = format(date, 'EEE d');
          return (
            <Tooltip key={dateKey}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-0.5 min-w-0">
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full flex-shrink-0 transition-colors duration-300",
                      active
                        ? "streak-dot-volume opacity-0 animate-streak-dot-enter"
                        : "bg-muted"
                    )}
                    style={active ? { animationDelay: `${i * 55}ms` } : undefined}
                  />
                  <span className="text-[9px] text-muted-foreground tabular-nums">
                    {dayLabel}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {fullLabel} {active ? '✓' : '—'}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {canFreeze && (
        <div className="pt-1 border-t border-sidebar-border">
          <p className="text-[10px] text-muted-foreground mb-1.5">Missed yesterday?</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs gap-1"
            onClick={handleUseFreeze}
          >
            <Snowflake className="h-3 w-3" />
            Use streak freeze
          </Button>
        </div>
      )}
      </div>
    </>
  );
}
