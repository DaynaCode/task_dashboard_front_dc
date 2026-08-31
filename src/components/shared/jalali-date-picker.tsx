import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  formatJalali,
  jalaaliMonthLength,
  jalaaliToDate,
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAY_NAMES,
  toJalaaliParts,
  toPersianDigits,
} from "@/lib/jalali";
import { cn } from "@/lib/utils";

interface JalaliDatePickerProps {
  /** Gregorian ISO date string ("YYYY-MM-DD") or null/empty for no selection. */
  value?: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
  /** When true, months before the current month (and days before today) cannot be selected. */
  disablePast?: boolean;
}

export function JalaliDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className,
  disablePast = false,
}: JalaliDatePickerProps) {
  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  const base = selectedDate ?? today;
  const { jy: initialJy, jm: initialJm } = toJalaaliParts(base);
  const { jy: todayJy, jm: todayJm, jd: todayJd } = toJalaaliParts(today);

  const [viewYear, setViewYear] = useState(initialJy);
  const [viewMonth, setViewMonth] = useState(initialJm);
  const [open, setOpen] = useState(false);

  const selectedParts = selectedDate ? toJalaaliParts(selectedDate) : null;

  const daysInMonth = jalaaliMonthLength(viewYear, viewMonth);
  const firstOfMonth = jalaaliToDate(viewYear, viewMonth, 1);
  // JS getDay(): 0=Sunday..6=Saturday. Jalali week starts Saturday.
  const leadingBlanks = (firstOfMonth.getDay() + 1) % 7;

  const isPastMonth = disablePast && (viewYear < todayJy || (viewYear === todayJy && viewMonth <= todayJm));
  const isViewedMonthFullyPast =
    disablePast && (viewYear < todayJy || (viewYear === todayJy && viewMonth < todayJm));
  const isDayDisabled = (jd: number) =>
    disablePast &&
    (isViewedMonthFullyPast || (viewYear === todayJy && viewMonth === todayJm && jd < todayJd));

  const goPrevMonth = () => {
    if (isPastMonth) return;
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectDay = (jd: number) => {
    if (isDayDisabled(jd)) return;
    const date = jalaaliToDate(viewYear, viewMonth, jd);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;
    onChange(iso);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-start gap-2 font-normal", !value && "text-muted-foreground", className)}
        >
          <CalendarDays className="h-4 w-4" />
          {value ? formatJalali(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="mb-2 flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={goNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <p className="text-sm font-medium">
            {JALALI_MONTH_NAMES[viewMonth - 1]} {toPersianDigits(viewYear)}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={goPrevMonth}
            disabled={isPastMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {JALALI_WEEKDAY_NAMES.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const jd = i + 1;
            const isSelected =
              selectedParts?.jy === viewYear && selectedParts?.jm === viewMonth && selectedParts?.jd === jd;
            const disabled = isDayDisabled(jd);
            return (
              <button
                key={jd}
                type="button"
                onClick={() => selectDay(jd)}
                disabled={disabled}
                className={cn(
                  "aspect-square rounded-md text-sm hover:bg-accent",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                  disabled && "cursor-not-allowed text-muted-foreground/40 hover:bg-transparent",
                )}
              >
                {toPersianDigits(jd)}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
