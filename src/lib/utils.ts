import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple Tailwind CSS class names into a single string.
 * It resolves conflicts using tailwind-merge and handles conditional classes using clsx.
 * @param inputs Class value inputs to merge.
 * @returns A merged string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
