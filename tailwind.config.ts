import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        priority: {
          high: "hsl(var(--priority-high))",
          medium: "hsl(var(--priority-medium))",
          low: "hsl(var(--priority-low))",
        },
        pomodoro: {
          DEFAULT: "hsl(var(--pomodoro))",
          break: "hsl(var(--pomodoro-break))",
        },
        success: "hsl(var(--success))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "timer-tick": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
        "streak-flame-pulse": {
          "0%, 100%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.08)", filter: "brightness(1.2)" },
        },
        "streak-pop": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "70%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "streak-number-bounce": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.25)" },
          "50%": { transform: "scale(0.9)" },
          "70%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        "streak-level-burst": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
          "70%": { transform: "scale(0.98)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "streak-dot-fill": {
          "0%": { transform: "scale(0.5)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "streak-dot-enter": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "60%": { transform: "scale(1.12)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "streak-flame-burn": {
          "0%, 100%": { transform: "scale(1) translateY(0)", filter: "brightness(1)" },
          "15%": { transform: "scale(1.04) translateY(-1px)", filter: "brightness(1.15)" },
          "30%": { transform: "scale(0.98) translateY(0)", filter: "brightness(0.92)" },
          "45%": { transform: "scale(1.06) translateY(-1px)", filter: "brightness(1.2)" },
          "60%": { transform: "scale(1) translateY(0)", filter: "brightness(0.98)" },
          "75%": { transform: "scale(1.03) translateY(-1px)", filter: "brightness(1.1)" },
        },
        "streak-shine": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "timer-tick": "timer-tick 1s ease-in-out",
        "streak-flame-pulse": "streak-flame-pulse 1.5s ease-in-out infinite",
        "streak-pop": "streak-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "streak-number-bounce": "streak-number-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "streak-level-burst": "streak-level-burst 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "streak-dot-fill": "streak-dot-fill 0.35s ease-out forwards",
        "streak-dot-enter": "streak-dot-enter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "streak-flame-burn": "streak-flame-burn 2.2s ease-in-out infinite",
        "streak-shine": "streak-shine 1.5s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
