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
  return crypto.randomUUID();
}

export function generateKey(prefix: string): string {
  // Генерируем уникальный номер для задач (например, WEB-1, WEB-2, ...)
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const uniqueNumber = (timestamp + random) % 10000; // Ограничиваем до 4 цифр
  return `${prefix}-${uniqueNumber}`;
}