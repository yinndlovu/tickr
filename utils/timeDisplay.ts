// external
import {
  differenceInDays,
  differenceInHours,
  intervalToDuration,
} from "date-fns";

// internal
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
  const days = d.days || 0;
  const hours = d.hours || 0;

  if (mode === "months_days_hours") {
    const monthsTotal = years * 12 + monthsRemainder;

    const textParts: string[] = [];
    if (monthsTotal > 0) textParts.push(`${monthsTotal} months`);
    textParts.push(`${days} days`);
    textParts.push(`${hours} hrs`);

    return {
      text: textParts.join(" "),
      parts: { months: monthsTotal, days, hours },
    };
  }

  const textParts: string[] = [];
  if (years > 0) {
    textParts.push(`${years} year${years === 1 ? "" : "s"}`);
  }
  if (monthsRemainder > 0) {
    textParts.push(
      `${monthsRemainder} month${monthsRemainder === 1 ? "" : "s"}`,
    );
  }
  textParts.push(`${days} days`);
  textParts.push(`${hours} hrs`);

  return {
    text: textParts.join(" "),
    parts: { years, months: monthsRemainder, days, hours },
  };
}
