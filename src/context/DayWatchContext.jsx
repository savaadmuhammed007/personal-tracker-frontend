import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getLocalDateString } from '../utils/dateUtils';

const DayWatchContext = createContext(null);

export const DayWatchProvider = ({ children }) => {
  const [todayDate, setTodayDate] = useState(getLocalDateString);
  const [revision, setRevision] = useState(0);
  const todayRef = useRef(todayDate);
  const lastActiveRef = useRef(Date.now());

  /**
   * Checks if client calendar day has advanced past midnight,
   * or forces a fresh synchronization across all pages.
   */
  const checkDayRollover = useCallback((forceRefresh = false) => {
    const currentLocal = getLocalDateString();
    const prevDate = todayRef.current;
    const isDifferentDay = currentLocal !== prevDate;
    const now = Date.now();
    const isStale = now - lastActiveRef.current > 60000; // Inactive for > 1 min
    lastActiveRef.current = now;

    if (isDifferentDay || forceRefresh) {
      todayRef.current = currentLocal;
      setTodayDate(currentLocal);
      setRevision((r) => r + 1);

      // Dispatch global window event for components or non-React listeners
      try {
        window.dispatchEvent(
          new CustomEvent('app:day-changed', {
            detail: { newDate: currentLocal, oldDate: prevDate, force: forceRefresh },
          })
        );
      } catch (e) {}

      return true;
    } else if (isStale && forceRefresh) {
      setRevision((r) => r + 1);
    }
    return false;
  }, []);

  const refreshDay = useCallback(() => {
    checkDayRollover(true);
  }, [checkDayRollover]);

  useEffect(() => {
    // 1. Check on Window Focus (e.g. clicking back into the browser window)
    const handleFocus = () => {
      checkDayRollover(false);
    };

    // 2. Check on Tab Visibility Change (e.g. resuming tab after wake from sleep)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDayRollover(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. High-reliability interval safety check (every 30 seconds)
    const interval = setInterval(() => {
      checkDayRollover(false);
    }, 30000);

    // 4. Precision timer scheduled right at client's local midnight
    let midnightTimeout = null;
    const scheduleMidnightTimer = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1,
        0
      );
      const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());

      midnightTimeout = setTimeout(() => {
        checkDayRollover(true);
        scheduleMidnightTimer();
      }, msUntilMidnight);
    };

    scheduleMidnightTimer();

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      if (midnightTimeout) clearTimeout(midnightTimeout);
    };
  }, [checkDayRollover]);

  return (
    <DayWatchContext.Provider value={{ todayDate, revision, refreshDay }}>
      {children}
    </DayWatchContext.Provider>
  );
};

export const useDayWatch = () => {
  const context = useContext(DayWatchContext);
  if (!context) {
    return { todayDate: getLocalDateString(), revision: 0, refreshDay: () => {} };
  }
  return context;
};
