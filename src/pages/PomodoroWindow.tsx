import { TodoProvider } from "@/stores/TodoContext";
import { PomodoroTimer } from "@/components/PomodoroTimer";

const PomodoroWindowContent = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-xs p-4">
        <PomodoroTimer />
      </div>
    </div>
  );
};

const PomodoroWindow = () => {
  return (
    <TodoProvider>
      <PomodoroWindowContent />
    </TodoProvider>
  );
};

export default PomodoroWindow;

