import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGB(bytes: number): string {
  if (!bytes || bytes <= 0) return "0.00";
  return (bytes / 1024 ** 3).toFixed(2);
}
//deployment
