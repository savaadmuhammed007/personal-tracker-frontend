/**
 * Date and Timezone Utilities
 * Ensures the frontend always uses the client's local calendar date
 * so that server UTC midnight shifts do not desynchronize completed habits, prayers, or tasks.
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
 * Checks if a habit is scheduled for a given date (or today if not specified).
 * If today is Friday (weekday 4):
 * - Daily habits -> true
 * - Friday specific/weekly habits -> true
 * - Weekdays (Mon-Fri) -> true
 * - Other days (Sat, Sun, etc.) -> false
 */
export const isHabitScheduledToday = (habit, targetDate = getLocalDateString()) => {
  if (!habit || habit.is_active === false) return false;

  const todayStr = getLocalDateString();
  const targetDateStr = typeof targetDate === 'string' ? targetDate : getLocalDateString(targetDate);
  const isTargetToday = !targetDate || targetDateStr === todayStr;

  // If habit has backend evaluated is_scheduled_today and checking for today
  if (isTargetToday && habit.is_scheduled_today !== undefined && habit.is_scheduled_today !== null) {
    return Boolean(habit.is_scheduled_today);
  }

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

