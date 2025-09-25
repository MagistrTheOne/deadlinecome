"use client";

import { memo, useMemo, useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Оптимизированный компонент статистики
interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
  className?: string;
}

export const OptimizedStatsCard = memo<StatsCardProps>(({ 
  title, 
  value, 
  description, 
  trend, 
  loading = false,
  className 
}) => {
  const trendColor = useMemo(() => {
    switch (trend) {
      case "up": return "text-green-400";
      case "down": return "text-red-400";
      default: return "text-white/60";
    }
  }, [trend]);

  if (loading) {
    return (
      <Card className={cn("bg-black/50 backdrop-blur-sm border border-white/20", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-white/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {description && (
              <p className={cn("text-xs mt-1", trendColor)}>{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedStatsCard.displayName = "OptimizedStatsCard";

// Оптимизированный компонент прогресса
interface OptimizedProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: "blue" | "green" | "yellow" | "red";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const OptimizedProgress = memo<OptimizedProgressProps>(({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true,
  color = "blue",
  size = "md",
  className 
}) => {
  const percentage = useMemo(() => {
    return Math.min(100, Math.max(0, (value / max) * 100));
  }, [value, max]);

  const colorClasses = useMemo(() => {
    switch (color) {
      case "blue": return "bg-blue-500";
      case "green": return "bg-green-500";
      case "yellow": return "bg-yellow-500";
      case "red": return "bg-red-500";
      default: return "bg-blue-500";
    }
  }, [color]);

  const sizeClasses = useMemo(() => {
    switch (size) {
      case "sm": return "h-1";
      case "md": return "h-2";
      case "lg": return "h-3";
      default: return "h-2";
    }
  }, [size]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-white/80 text-sm">{label}</span>
          {showPercentage && (
            <span className="text-white/60 text-sm">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-white/10 rounded-full overflow-hidden", sizeClasses)}>
        <div 
          className={cn("h-full transition-all duration-500 ease-out", colorClasses)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

OptimizedProgress.displayName = "OptimizedProgress";

// Оптимизированный компонент списка
interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  itemClassName?: string;
}

export const OptimizedList = memo<OptimizedListProps<any>>(({ 
  items, 
  renderItem, 
  keyExtractor, 
  loading = false,
  emptyMessage = "Нет данных",
  className,
  itemClassName 
}) => {
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-white/10 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("text-center py-8 text-white/60", className)}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
});

OptimizedList.displayName = "OptimizedList";

// Виртуализированный список для больших данных
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
}

export const VirtualizedList = memo<VirtualizedListProps<any>>(({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem, 
  keyExtractor,
  className 
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight;

  return (
    <div 
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div 
              key={keyExtractor(item, index)}
              style={{ height: itemHeight }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualizedList.displayName = "VirtualizedList";

// Оптимизированный компонент поиска
interface OptimizedSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
  loading?: boolean;
}

export const OptimizedSearch = memo<OptimizedSearchProps>(({ 
  placeholder = "Поиск...", 
  onSearch, 
  debounceMs = 300,
  className,
  loading = false 
}) => {
  const [query, setQuery] = useState("");

  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchQuery: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onSearch(searchQuery);
        }, debounceMs);
      };
    })(),
    [onSearch, debounceMs]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <div className={cn("relative", className)}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        disabled={loading}
        className="w-full px-4 py-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:outline-none transition-all duration-200"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
});

OptimizedSearch.displayName = "OptimizedSearch";

// Хук для оптимизации API вызовов
export const useOptimizedFetch = <T>(
  url: string,
  options?: RequestInit,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Хук для дебаунса
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Хук для виртуализации
export const useVirtualization = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) => {
  return useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      itemCount
    );
    
    return {
      startIndex,
      endIndex,
      totalHeight: itemCount * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [itemCount, itemHeight, containerHeight, scrollTop]);
};
