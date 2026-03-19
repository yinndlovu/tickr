import {
  differenceInDays,
  differenceInHours,
  intervalToDuration,
} from "date-fns";
import { TimeDisplayMode } from "../context/PreferencesContext";

export function formatHabitDuration(
  startDate: string,
  mode: TimeDisplayMode,
  now: Date = new Date(),
) {
  const start = new Date(startDate);

  if (mode === "days_hours") {
    const totalDays = Math.max(0, differenceInDays(now, start));
    const totalHours = Math.max(0, differenceInHours(now, start));
    const hours = totalHours % 24;
    return {
      text: `${totalDays} days ${hours} hrs`,
      parts: { days: totalDays, hours },
    };
  }

  const d = intervalToDuration({ start, end: now });
  const years = d.years || 0;
  const monthsRemainder = d.months || 0;
  const months = years * 12 + monthsRemainder;
  const days = d.days || 0;
  const hours = d.hours || 0;

  return {
    text: `${months} months ${days} days ${hours} hrs`,
    parts: { months, days, hours },
  };
}
