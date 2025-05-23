import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, "h:mm a")}`;
  } else if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, "h:mm a")}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, "h:mm a")}`;
  } else {
    return format(dateObj, "EEE, MMM d, h:mm a");
  }
}

export function getPriorityColor(priority: string): { 
  textColor: string, 
  bgColor: string,
  borderColor: string 
} {
  switch (priority) {
    case "high":
      return { 
        textColor: "text-priority-high", 
        bgColor: "bg-red-100",
        borderColor: "border-priority-high"
      };
    case "medium":
      return { 
        textColor: "text-priority-medium", 
        bgColor: "bg-amber-100",
        borderColor: "border-priority-medium" 
      };
    case "low":
      return { 
        textColor: "text-priority-low", 
        bgColor: "bg-green-100",
        borderColor: "border-priority-low" 
      };
    default:
      return { 
        textColor: "text-gray-500", 
        bgColor: "bg-gray-100",
        borderColor: "border-gray-300" 
      };
  }
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "yyyy-MM-dd");
}

export function formatTimeForInput(date: Date | string | null): string {
  if (!date) return '';
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "HH:mm");
}

export function mergeDateAndTime(date: string, time: string): Date | null {
  if (!date) return null;
  
  const [year, month, day] = date.split('-').map(Number);
  let hours = 0;
  let minutes = 0;
  
  if (time) {
    const [hoursStr, minutesStr] = time.split(':');
    hours = parseInt(hoursStr, 10);
    minutes = parseInt(minutesStr, 10);
  }
  
  return new Date(year, month - 1, day, hours, minutes);
}

export function countCompletedSubtasks(subtasks: Array<{ completed: boolean }>): number {
  return subtasks.filter(subtask => subtask.completed).length;
}
