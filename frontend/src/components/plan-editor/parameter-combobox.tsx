import React, { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { Button } from 'shad/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'shad/components/ui/command';
import { ParameterType } from '@/services/types';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParameterComboboxProps {
  allParameterTypes: ParameterType[];
  selectedParameterIds: (number | null)[]; // Use IDs to filter available options
  onSelectExisting: (parameter: ParameterType) => void;
  onTriggerAddNew: () => void;
}

const ParameterCombobox: React.FC<ParameterComboboxProps> = ({
  allParameterTypes = [],
  selectedParameterIds = [],
  onSelectExisting,
  onTriggerAddNew,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(''); // Tracks the selected value for display
  const [search, setSearch] = useState('');

  const availableParameterTypes = useMemo(() => {
    const selectedSet = new Set(selectedParameterIds.filter((id) => id !== null));
    return allParameterTypes.filter((pt) => !selectedSet.has(pt.id));
  }, [allParameterTypes, selectedParameterIds]);

  const handleSelect = (currentValue: string) => {
    const selectedId = parseInt(currentValue, 10);
    const selectedParam = allParameterTypes.find((pt) => pt.id === selectedId);

    if (selectedParam) {
      setValue(selectedParam.name); // Update display value
      onSelectExisting(selectedParam);
      setOpen(false);
      setSearch(''); // Clear search after selection
      setValue(''); // Clear combobox display after selection
    } else {
      console.error('Selected parameter not found');
      setOpen(false);
    }
  };

  const handleAddNew = () => {
    onTriggerAddNew();
    setOpen(false);
    setSearch('');
  };

  // Determine if the search term exactly matches an available parameter name (case-insensitive)
  const searchMatchesExisting = useMemo(() => {
    if (!search) return false;
    return availableParameterTypes.some((pt) => pt.name.toLowerCase() === search.toLowerCase());
  }, [search, availableParameterTypes]);

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground"
        >
          {value
            ? (allParameterTypes.find((pt) => String(pt.id) === value)?.name ??
              'Select parameter...')
            : 'Add or select parameter...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          {' '}
          {/* Disable default filtering */}
          <CommandInput
            placeholder="Search or type name..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {search && !searchMatchesExisting ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 py-1.5 text-sm"
                  onClick={handleAddNew}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create new parameter "{search}"
                </Button>
              ) : (
                'No parameters found.'
              )}
            </CommandEmpty>
            <CommandGroup>
              {availableParameterTypes
                .filter((pt) => pt.name.toLowerCase().includes(search.toLowerCase()))
                .map((pt) => (
                  <CommandItem
                    key={pt.id}
                    value={String(pt.id)} // Store ID as value
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === String(pt.id) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {pt.name} {pt.defaultUnit && `(${pt.defaultUnit})`}
                  </CommandItem>
                ))}
              {/* Add new button when search is empty or matches */}
              {(!search || searchMatchesExisting) && (
                <CommandItem
                  key="add-new-empty-search"
                  value="add-new"
                  onSelect={handleAddNew}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create a new parameter...
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ParameterCombobox;
