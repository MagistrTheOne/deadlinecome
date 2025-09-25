import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function generateKey(prefix: string): string {
  return `${prefix}-${generateId().toUpperCase()}`;
}