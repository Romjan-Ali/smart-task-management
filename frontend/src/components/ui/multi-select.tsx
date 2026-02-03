'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      handleUnselect(value);
    } else {
      onChange([...selected, value]);
    }
    setSearchValue('');
  };

  const selectedOptions = options.filter((option) => selected.includes(option.value));
  const filteredOptions = options.filter(
    (option) =>
      !selected.includes(option.value) &&
      option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'flex min-h-10 w-full flex-wrap gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onClick={() => !disabled && setOpen(true)}
      >
        {selectedOptions.map((option) => (
          <Badge key={option.value} variant="secondary" className="gap-1">
            {option.label}
            {!disabled && (
              <button
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUnselect(option.value);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUnselect(option.value);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </Badge>
        ))}
        {!disabled && (
          <input
            placeholder={selectedOptions.length === 0 ? placeholder : ''}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setOpen(true)}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
          />
        )}
      </div>
      {open && !disabled && (
        <>
          <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="max-h-64 overflow-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}
