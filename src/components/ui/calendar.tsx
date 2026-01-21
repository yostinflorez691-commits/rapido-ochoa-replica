"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  className?: string;
}

const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function Calendar({ selectedDate, onDateSelect, minDate, className }: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(selectedDate || today);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(0);

  const effectiveMinDate = minDate || today;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    if (isAnimating) return;
    setDirection(-1);
    setIsAnimating(true);
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setTimeout(() => setIsAnimating(false), 200);
  };

  const goToNextMonth = () => {
    if (isAnimating) return;
    setDirection(1);
    setIsAnimating(true);
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setTimeout(() => setIsAnimating(false), 200);
  };

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true;
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const minDateOnly = new Date(effectiveMinDate);
    minDateOnly.setHours(0, 0, 0, 0);
    return dateOnly < minDateOnly;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const handleDateClick = (date: Date | null) => {
    if (!date || isDateDisabled(date)) return;
    onDateSelect(date);
  };

  const days = getDaysInMonth(currentMonth);

  // Check if we can go to previous month
  const canGoPrevious = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    return lastDayPrevMonth >= effectiveMinDate;
  };

  return (
    <div className={cn("w-full max-w-[320px] rounded-xl bg-white p-4 shadow-lg border border-gray-200", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            canGoPrevious()
              ? "text-gray-600 hover:bg-gray-100"
              : "text-gray-300 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h3 className="text-[15px] font-semibold text-gray-800">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button
          type="button"
          onClick={goToNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-[11px] font-semibold text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentMonth.toISOString()}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {days.map((date, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(date)}
              disabled={isDateDisabled(date)}
              className={cn(
                "flex h-9 w-full items-center justify-center rounded-full text-[13px] transition-all",
                !date && "invisible",
                date && !isDateDisabled(date) && !isDateSelected(date) && "hover:bg-gray-100",
                isDateDisabled(date) && "cursor-not-allowed text-gray-300",
                isDateSelected(date) && "bg-[#002674] text-white font-semibold",
                isToday(date) && !isDateSelected(date) && "border-2 border-[#002674] font-semibold text-[#002674]",
                !isDateDisabled(date) && !isDateSelected(date) && !isToday(date) && "text-gray-700"
              )}
            >
              {date?.getDate()}
            </button>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Footer with quick options */}
      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => onDateSelect(today)}
          className={cn(
            "flex-1 rounded-full border px-3 py-2 text-[12px] font-medium transition-all",
            selectedDate?.toDateString() === today.toDateString()
              ? "border-[#002674] bg-[#002674]/5 text-[#002674]"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          )}
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            onDateSelect(tomorrow);
          }}
          className={cn(
            "flex-1 rounded-full border px-3 py-2 text-[12px] font-medium transition-all",
            selectedDate?.toDateString() === new Date(today.getTime() + 86400000).toDateString()
              ? "border-[#002674] bg-[#002674]/5 text-[#002674]"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          )}
        >
          Manana
        </button>
      </div>
    </div>
  );
}

export default Calendar;
