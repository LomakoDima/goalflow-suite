import { useState } from 'react';
import { useTodo } from '@/stores/TodoContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target } from 'lucide-react';

export function AddGoalDialog() {
  const { addGoal, categories } = useTodo();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
    });
    setTitle('');
    setDescription('');
    setCategoryId('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 border-border text-foreground hover:bg-secondary">
          <Target className="h-4 w-4" />
          Цель
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Новая цель</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Название</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='Например: "Запустить MVP Auralis"'
              className="mt-1 bg-secondary border-0"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Описание</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Опишите цель..."
              className="mt-1 bg-secondary border-0 resize-none"
              rows={2}
            />
          </div>
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
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Создать цель
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
