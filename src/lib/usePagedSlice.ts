import { useCallback, useEffect, useRef, useState } from "react";

/** Cards mounted at once. More load when the sentinel nears the viewport. */
export const LIST_PAGE = 24;

export function usePagedSlice<T extends { id: string }>(items: T[], pageSize = LIST_PAGE) {
  const [count, setCount] = useState(pageSize);
  const ids = items.map((item) => item.id).join("\0");

  useEffect(() => {
    setCount(pageSize);
  }, [ids, pageSize]);

  const slice = items.slice(0, count);
  const hasMore = count < items.length;
  const loadMore = useCallback(() => {
    setCount((n) => (n >= items.length ? n : Math.min(items.length, n + pageSize)));
  }, [items.length, pageSize]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: "320px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadMore, slice.length]);

  return { slice, hasMore, loadMore, sentinelRef, shown: slice.length, total: items.length };
}
