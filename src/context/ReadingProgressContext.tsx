import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ReadingTimeResult } from '../utils/readingTime';

export interface ReadingProgressContextType {
  // Current progress 0 to 100
  progress: number;
  // Whether the user is actively reading/scrolling inside long-form content (Legal Insights or Case Briefs)
  isLongFormActive: boolean;
  // Descriptive label of the active long-form matter or article
  activeTitle: string | null;
  // Type of long-form item being read
  sourceType: 'insight' | 'case' | 'section-insights' | 'section-cases' | null;
  // Reading depth statistics if available
  readingMetrics: ReadingTimeResult | null;
  // Actions
  setLongFormProgress: (
    progress: number, 
    sourceType: 'insight' | 'case' | 'section-insights' | 'section-cases',
    title?: string, 
    metrics?: ReadingTimeResult | null
  ) => void;
  clearLongFormProgress: () => void;
}

const ReadingProgressContext = createContext<ReadingProgressContextType | undefined>(undefined);

export const ReadingProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isLongFormActive, setIsLongFormActive] = useState<boolean>(false);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<'insight' | 'case' | 'section-insights' | 'section-cases' | null>(null);
  const [readingMetrics, setReadingMetrics] = useState<ReadingTimeResult | null>(null);

  // Debounce / throttle ref to keep updates smooth
  const lastUpdateRef = useRef<number>(0);

  const setLongFormProgress = useCallback((
    newProgress: number,
    type: 'insight' | 'case' | 'section-insights' | 'section-cases',
    title?: string,
    metrics?: ReadingTimeResult | null
  ) => {
    const clamped = Math.min(100, Math.max(0, newProgress));
    setProgress(clamped);
    setIsLongFormActive(true);
    setSourceType(type);
    if (title !== undefined) setActiveTitle(title);
    if (metrics !== undefined) setReadingMetrics(metrics);
  }, []);

  const clearLongFormProgress = useCallback(() => {
    setIsLongFormActive(false);
    setActiveTitle(null);
    setSourceType(null);
    setReadingMetrics(null);
  }, []);

  return (
    <ReadingProgressContext.Provider
      value={{
        progress,
        isLongFormActive,
        activeTitle,
        sourceType,
        readingMetrics,
        setLongFormProgress,
        clearLongFormProgress
      }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
};

export const useReadingProgress = (): ReadingProgressContextType => {
  const context = useContext(ReadingProgressContext);
  if (!context) {
    throw new Error('useReadingProgress must be used within a ReadingProgressProvider');
  }
  return context;
};
