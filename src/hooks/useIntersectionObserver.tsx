import { useEffect, useState, useRef, RefObject } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  }: UseIntersectionObserverProps = {}
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    const node = elementRef?.current; // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return entry;
}

// Hook for simple visibility detection
export function useIsVisible(
  elementRef: RefObject<Element>,
  options?: UseIntersectionObserverProps
) {
  const entry = useIntersectionObserver(elementRef, options);
  return !!entry?.isIntersecting;
}

// Hook for lazy loading content when element becomes visible
export function useLazyLoad<T>(
  elementRef: RefObject<Element>,
  loadFn: () => Promise<T>,
  options?: UseIntersectionObserverProps
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isVisible = useIsVisible(elementRef, options);

  useEffect(() => {
    if (isVisible && !data && !loading) {
      setLoading(true);
      setError(null);
      
      loadFn()
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [isVisible, data, loading, loadFn]);

  return { data, loading, error, isVisible };
}