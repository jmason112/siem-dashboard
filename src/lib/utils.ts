import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function generateMockTimeSeriesData(points: number): { timestamp: Date; value: number }[] {
  const data = [];
  const now = new Date();
  
  for (let i = points; i > 0; i--) {
    data.push({
      timestamp: new Date(now.getTime() - i * 60000),
      value: Math.floor(Math.random() * 100),
    });
  }
  
  return data;
}