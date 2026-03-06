import { useEffect } from 'react';

export function useDebounce<T>(value: T, callback: (value: T) => void, delay = 300): void {
  useEffect(() => {
    const timer = setTimeout(() => callback(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);
}
