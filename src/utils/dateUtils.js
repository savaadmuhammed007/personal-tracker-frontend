/**
 * Date and Timezone Utilities
 * Ensures the frontend always uses the client's local calendar date
 * so that server UTC midnight shifts do not desynchronize completed habits, prayers, or tasks.
 */

export const getLocalDateString = (d = new Date()) => {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return new Date().toISOString().split('T')[0];

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayWeekdayIndex = (d = new Date()) => {
  // Convert JS Sunday(0)..Saturday(6) to Python Monday(0)..Sunday(6)
  return (d.getDay() + 6) % 7;
};
