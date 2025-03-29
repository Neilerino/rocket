'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Popover } from '@heroui/react';
import { motion, AnimatePresence } from 'motion/react';

import { cn } from '@/lib/utils';
import { Button } from 'shad/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'shad/components/ui/command';
import { Exercise as ServiceExercise } from '@/services/types';

interface ExerciseSelectionProps {
  exercises: ServiceExercise[];
  value: ServiceExercise | null;
  onChange: (exercise: ServiceExercise | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundText?: string;
  className?: string;
}

const ExerciseSelection: React.FC<ExerciseSelectionProps> = ({
  exercises,
  value,
  onChange,
  placeholder = 'Select exercise...',
  searchPlaceholder = 'Search exercise...',
  notFoundText = 'No exercise found.',
  className,
}) => {
  const [open, setOpen] = React.useState(false); // Re-introduce state

  const handleSelect = (selectedValue: string) => {
    const selectedExercise = exercises.find(
      (exercise) => exercise.name.toLowerCase() === selectedValue.toLowerCase(),
    );
    onChange(selectedExercise || null);
  };

  return (
    <Popover className={cn('relative', className)}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open} // Use state variable
        className={'w-full justify-between'}
        onClick={() => setOpen((o) => !o)} // Toggle state on click
      >
        {value ? value.name : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Animated Panel */}
      <AnimatePresence>
        {open && ( // Animate based on state variable
          <motion.div
            // Note: Need to ensure Popover closes on outside click.
            // @heroui/react might handle this, or might need manual implementation.
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.1 }}
            className="absolute z-10 mt-1 w-full bg-popover p-0 shadow-md rounded-md border"
          >
            <Command>
              <CommandInput placeholder={searchPlaceholder} />
              <CommandList>
                <CommandEmpty>{notFoundText}</CommandEmpty>
                <CommandGroup>
                  {exercises.map((exercise) => (
                    <CommandItem
                      key={exercise.id}
                      value={exercise.name}
                      onSelect={(currentValue) => {
                        handleSelect(currentValue);
                        setOpen(false); // Close popover on select
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value?.id === exercise.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {exercise.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </motion.div>
        )}
      </AnimatePresence>
    </Popover>
  );
};

export default ExerciseSelection;
