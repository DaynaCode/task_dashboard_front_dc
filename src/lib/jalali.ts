import * as jalaali from "jalaali-js";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Formats a Gregorian Date (or ISO string) as a Jalali "YYYY/MM/DD" string using Persian digits. */
export function formatJalali(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const { jy, jm, jd } = jalaali.toJalaali(d);
  return toPersianDigits(`${jy}/${pad2(jm)}/${pad2(jd)}`);
}

/** Formats a Gregorian Date (or ISO string) as Jalali date + time. */
export function formatJalaliDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return `${formatJalali(d)} ${toPersianDigits(time)}`;
}

/** Converts a Jalali "YYYY/MM/DD" string (Persian or Latin digits) to an ISO "YYYY-MM-DD" (Gregorian) string. */
export function jalaliToIso(value: string): string | null {
  const normalized = toLatinDigits(value).trim();
  const match = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const jy = Number(match[1]);
  const jm = Number(match[2]);
  const jd = Number(match[3]);
  if (!jalaali.isValidJalaaliDate(jy, jm, jd)) return null;
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return `${gy}-${pad2(gm)}-${pad2(gd)}`;
}

/** Converts a Gregorian Date to its Jalali { jy, jm, jd } parts. */
export function toJalaaliParts(date: Date) {
  return jalaali.toJalaali(date);
}

/** Builds a Gregorian Date from Jalali year/month/day (local midnight). */
export function jalaaliToDate(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

export function jalaaliMonthLength(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm);
}

export const JALALI_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const JALALI_WEEKDAY_NAMES = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/** Returns a Persian, human-readable time-remaining (or overdue) string for a deadline. */
export function formatTimeRemaining(deadline: Date | string): string {
  const target = typeof deadline === "string" ? new Date(deadline) : deadline;
  const diffMs = target.getTime() - Date.now();
  const overdue = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  let value: number;
  let unit: string;
  if (absMs >= day) {
    value = Math.floor(absMs / day);
    unit = "روز";
  } else if (absMs >= hour) {
    value = Math.floor(absMs / hour);
    unit = "ساعت";
  } else if (absMs >= minute) {
    value = Math.floor(absMs / minute);
    unit = "دقیقه";
  } else {
    value = 0;
    unit = "دقیقه";
  }

  const amount = toPersianDigits(value);
  return overdue ? `${amount} ${unit} گذشته` : `${amount} ${unit} مانده`;
}
