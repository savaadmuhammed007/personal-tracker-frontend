/**
 * Date, Timezone and Daily Caching Utilities
 * Ensures the frontend always operates against the client's local calendar date
 * so that server UTC midnight shifts or day rollovers do not desynchronize
 * completed habits, prayers, tasks, or awrad.
 */

export const getLocalDateString = (d = new Date()) => {
  if (typeof d === 'string') {
    const trimmed = d.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const dateObj = new Date(d);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return trimmed;
  }
  const dateObj = d instanceof Date ? d : new Date();
  if (isNaN(dateObj.getTime())) return new Date().toISOString().split('T')[0];

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayWeekdayIndex = (d = new Date()) => {
  // Convert JS Sunday(0)..Saturday(6) to Python Monday(0)..Sunday(6)
  if (typeof d === 'string') {
    const parts = d.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day, 12, 0, 0);
      return (dateObj.getDay() + 6) % 7;
    }
    const dateObj = new Date(d);
    return (dateObj.getDay() + 6) % 7;
  }
  const dateObj = d instanceof Date ? d : new Date(d);
  return (dateObj.getDay() + 6) % 7;
};

export const parseSpecificDays = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(Number).filter((n) => !isNaN(n) && n >= 0 && n <= 6);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(Number).filter((n) => !isNaN(n) && n >= 0 && n <= 6);
    } catch {}
    return val.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n) && n >= 0 && n <= 6);
  }
  if (typeof val === 'number' && !isNaN(val) && val >= 0 && val <= 6) return [val];
  return [];
};

/**
 * Checks if a habit is scheduled for a given date (defaults to client's local today).
 */
export const isHabitScheduledToday = (habit, targetDate = getLocalDateString()) => {
  if (!habit || habit.is_active === false) return false;

  const targetDateStr = typeof targetDate === 'string' ? targetDate : getLocalDateString(targetDate);
  const weekday = getTodayWeekdayIndex(targetDateStr);
  const freq = habit.frequency || 'daily';
  const spec = parseSpecificDays(habit.specific_days);

  if (freq === 'daily') return true;
  if (freq === 'weekdays') return weekday < 5; // Monday (0) to Friday (4)
  if (freq === 'weekly_once' || freq === 'weekly_target' || freq === 'specific_days') {
    if (spec.length > 0) return spec.includes(weekday);
    return weekday === 4; // Default Friday (4)
  }
  return true;
};

/**
 * Sanitizes cached items from a past date to remove stale completion checkmarks/counts
 * while keeping layout-ready entities for zero-lag instant rendering.
 */
export const sanitizeDailyCacheList = (key, list, targetDate = getLocalDateString()) => {
  if (!Array.isArray(list)) return [];
  if (key.includes('habits')) {
    return list.map((h) => ({
      ...h,
      today_completion: null,
      is_scheduled_today: isHabitScheduledToday(h, targetDate),
    }));
  }
  if (key.includes('awrad')) {
    return list.map((a) => ({
      ...a,
      today_count: 0,
      is_completed: false,
      progress_percentage: 0,
    }));
  }
  if (key.includes('tasks')) {
    // For tasks, remove completed ones from previous day
    return list.filter((t) => t && t.status !== 'completed');
  }
  return list;
};

/**
 * Date-aware localStorage reader.
 * Enforces that cached completion states only apply to the current targetDate.
 */
export const getDailyCache = (key, defaultVal = null, targetDate = getLocalDateString()) => {
  try {
    if (typeof localStorage === 'undefined') return defaultVal;
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;

    const parsed = JSON.parse(raw);

    // Enveloped format: { date: 'YYYY-MM-DD', data: ... }
    if (parsed && typeof parsed === 'object' && 'date' in parsed && 'data' in parsed) {
      if (parsed.date === targetDate) {
        return parsed.data;
      }
      // If date mismatch, sanitize the old data to strip stale completion flags
      if (Array.isArray(parsed.data)) {
        return sanitizeDailyCacheList(key, parsed.data, targetDate);
      }
      return defaultVal;
    }

    // Legacy un-enveloped format: sanitize and re-envelope
    if (Array.isArray(parsed)) {
      return sanitizeDailyCacheList(key, parsed, targetDate);
    }

    return defaultVal;
  } catch {
    return defaultVal;
  }
};

/**
 * Date-aware localStorage writer.
 * Saves payload tagged with the client's local calendar date.
 */
export const setDailyCache = (key, data, targetDate = getLocalDateString()) => {
  try {
    if (typeof localStorage === 'undefined') return;
    const envelope = {
      date: targetDate,
      saved_at: new Date().toISOString(),
      data,
    };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {}
};

/**
 * Clears specific daily cache key
 */
export const clearDailyCache = (key) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {}
};
