'use client';

import React from "react"

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const COLORS_PALETTE = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#6366F1',
];

interface AddHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitAdded: () => void;
}

export function AddHabitModal({
  open,
  onOpenChange,
  onHabitAdded,
}: AddHabitModalProps) {
  const [type, setType] = useState<'avoid' | 'build'>('avoid');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [selectedColor, setSelectedColor] = useState(COLORS_PALETTE[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a habit name');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Connect to Supabase when environment variables are set up
      // For now, just show a message
      console.log('[v0] Habit to create:', { name, description, type, category, selectedColor });
      
      // Reset form
      setName('');
      setDescription('');
      setCategory('Health');
      setType('avoid');
      setSelectedColor(COLORS_PALETTE[0]);

      onOpenChange(false);
      onHabitAdded();
    } catch (err) {
      console.error('[v0] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add habit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track and monitor your progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Habit Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Habit Type</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as 'avoid' | 'build')}>
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer">
                <RadioGroupItem value="avoid" id="avoid" />
                <Label htmlFor="avoid" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Quit/Avoid</div>
                  <div className="text-sm text-muted-foreground">
                    Track days since stopping (e.g., smoking, drinking)
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer">
                <RadioGroupItem value="build" id="build" />
                <Label htmlFor="build" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Build/Maintain</div>
                  <div className="text-sm text-muted-foreground">
                    Track consistent streaks (e.g., gym, meditation)
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold">
              Habit Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., No Smoking, Daily Gym"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add a description for this habit..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="font-semibold">
              Category
            </Label>
            <div className="flex gap-2 flex-wrap">
              {['Health', 'Fitness', 'Mental', 'Productivity', 'Personal'].map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={category === cat ? 'default' : 'outline'}
                  onClick={() => setCategory(cat)}
                  className="rounded-full"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label className="font-semibold">Color</Label>
            <div className="flex gap-3">
              {COLORS_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-10 h-10 rounded-lg transition-all cursor-pointer ring-2 ring-offset-2
                    ${selectedColor === color ? 'ring-foreground scale-110' : 'ring-transparent hover:scale-105'}
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Creating...' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
