import { useState } from 'react';
import { useTodo } from '@/stores/TodoContext';
import { Priority } from '@/types/todo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

export function AddTaskDialog() {
  const { addTask, categories, goals } = useTodo();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState('');
  const [goalId, setGoalId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [pomodorosEstimated, setPomodorosEstimated] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      priority,
      categoryId: categoryId || undefined,
      goalId: goalId || undefined,
      deadline: deadline || undefined,
      pomodorosEstimated,
    });
    setTitle('');
    setPriority('medium');
    setCategoryId('');
    setGoalId('');
    setDeadline('');
    setPomodorosEstimated(1);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Задача
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Новая задача</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Название</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              className="mt-1 bg-secondary border-0"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Приоритет</Label>
              <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
                <SelectTrigger className="mt-1 bg-secondary border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 Высокий</SelectItem>
                  <SelectItem value="medium">🟡 Средний</SelectItem>
                  <SelectItem value="low">🟢 Низкий</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Помидоры</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={pomodorosEstimated}
                onChange={e => setPomodorosEstimated(Number(e.target.value))}
                className="mt-1 bg-secondary border-0"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Дедлайн</Label>
            <Input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="mt-1 bg-secondary border-0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Категория</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1 bg-secondary border-0">
                  <SelectValue placeholder="Без категории" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Цель</Label>
              <Select value={goalId} onValueChange={setGoalId}>
                <SelectTrigger className="mt-1 bg-secondary border-0">
                  <SelectValue placeholder="Без цели" />
                </SelectTrigger>
                <SelectContent>
                  {goals.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Создать задачу
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
