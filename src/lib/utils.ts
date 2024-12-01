import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateMockTimeSeriesData(days: number) {
  const data = [];
  const now = new Date();
  
  for (let i = days; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      timestamp: date,
      value: Math.floor(Math.random() * 100),
    });
  }
  
  return data;
}