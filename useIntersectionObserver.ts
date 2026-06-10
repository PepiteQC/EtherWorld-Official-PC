import { useEffect, useState, RefObject } from 'react';

interface Options {
  threshold?: number;
  rootMargin?: string;
}

export function useIntersectionObserver(
  ref: RefObject<Element | null>,
  options: Options = {}
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options.threshold, options.rootMargin]);

  return isVisible;
}
