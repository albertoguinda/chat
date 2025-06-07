import { useRef } from "react";

export function useDebounce(callback: () => void, delay: number = 500) {
  const timeout = useRef<NodeJS.Timeout | null>(null);

  return () => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(callback, delay);
  };
}
