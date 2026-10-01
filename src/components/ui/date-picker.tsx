'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';
import { FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function formatPickerDisplay(date: Date | undefined) {
  if (!date) {
    return '';
  }
  return format(date, 'd MMM yyyy');
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !Number.isNaN(date.getTime());
}

/** Parses YYYY-MM-DD into a local Date (for form string values). */
export function parseDateOnlyString(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return isValidDate(date) ? date : undefined;
}

/** Formats a Date as YYYY-MM-DD for API/form string storage. */
export function formatDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses manually typed dates.
// Accepts dd.mm.yy, dd.mm.yyyy, dd/mm/yy, dd-mm-yyyy, etc. (day-first)
// Falls back to native Date parsing for things like "June 01, 2025" or ISO strings.
function parseDate(input: string): Date | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  const match = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (match) {
    const [, d, m, y] = match;
    const day = Number.parseInt(d, 10);
    const month = Number.parseInt(m, 10);
    let year = Number.parseInt(y, 10);

    if (y.length === 2) {
      // pivot: 00-69 -> 2000s, 70-99 -> 1900s
      year += year < 70 ? 2000 : 1900;
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;

    const date = new Date(year, month - 1, day);
    // guards against overflow, e.g. 31.02.26 rolling into March
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return date;
    }
    return undefined;
  }

  // fallback for natural formats (e.g. "June 01, 2025")
  const fallback = new Date(trimmed);
  return isValidDate(fallback) ? fallback : undefined;
}

export type DatePickerInputProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: Date | undefined;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  'aria-invalid'?: boolean;
};

export function DatePickerInput({
  id = 'date',
  label,
  placeholder = 'June 01, 2025',
  value,
  onChange,
  onBlur,
  disabled,
  className,
  'aria-invalid': ariaInvalid,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value);
  const [draft, setDraft] = React.useState<string | null>(null);
  const displayValue = draft ?? formatPickerDisplay(value);

  React.useEffect(() => {
    if (value) setMonth(value);
  }, [value]);

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {label ? <FieldLabel htmlFor={id}>{label}</FieldLabel> : null}
      <InputGroup>
        <InputGroupInput
          id={id}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          onBlur={() => {
            setDraft(null);
            onBlur?.();
          }}
          onChange={(e) => {
            const nextText = e.target.value;
            setDraft(nextText);
            const nextDate = parseDate(nextText);
            if (nextDate) {
              onChange?.(nextDate);
              setMonth(nextDate);
            } else if (nextText.trim() === '') {
              onChange?.(undefined);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                id={`${id}-picker`}
                variant="ghost"
                size="icon-xs"
                aria-label="Select date"
                disabled={disabled}
              >
                <CalendarIcon />
                <span className="sr-only">Select date</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={value}
                month={month ?? value}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  onChange?.(date);
                  setDraft(null);
                  setMonth(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
