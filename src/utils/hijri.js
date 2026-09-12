/**
 * Kuwaiti Algorithm / Astronomical Hijri calculation with +/- day adjustment support.
 */

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
];

export const HIJRI_MONTHS_AR = [
  'مُحَرَّم', 'صَفَر', 'رَبِيع الأَوَّل', 'رَبِيع الآخِر',
  'جُمَادَى الأُولَى', 'جُمَادَى الآخِرَة', 'رَجَب', 'شَعْبَان',
  'رَمَضَان', 'شَوَّال', 'ذُو القَعْدَة', 'ذُو الحِجَّة'
];

export function getHijriDate(dateObj = new Date(), adjustmentDays = 0) {
  const d = new Date(dateObj);
  if (adjustmentDays) {
    d.setDate(d.getDate() + parseInt(adjustmentDays, 10));
  }

  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  const day = d.getDate();

  if (month < 3) {
    year -= 1;
    month += 12;
  }

  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;

  const islamicEpoch = 1948439.5;
  const daysSinceEpoch = jd - islamicEpoch;

  let hYear = Math.floor(daysSinceEpoch / 354.367) + 1;
  const remDays = daysSinceEpoch - (hYear - 1) * 354.367;

  let hMonth = Math.floor(remDays / 29.5) + 1;
  if (hMonth > 12) {
    hYear += 1;
    hMonth = 1;
  }

  let hDay = Math.floor(remDays - (hMonth - 1) * 29.5) + 1;
  if (hDay < 1) hDay = 1;
  if (hDay > 30) hDay = 30;

  const monthName = HIJRI_MONTHS[hMonth - 1] || HIJRI_MONTHS[0];
  const monthNameAr = HIJRI_MONTHS_AR[hMonth - 1] || HIJRI_MONTHS_AR[0];

  return {
    day: hDay,
    month: hMonth,
    year: hYear,
    monthName,
    monthNameAr,
    formatted: `${hDay} ${monthName} ${hYear} AH`,
    formattedAr: `${hDay} ${monthNameAr} ${hYear} هـ`,
  };
}
