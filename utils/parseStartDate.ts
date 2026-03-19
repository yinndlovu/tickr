export function parseStartDate(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      ok: false as const,
      date: null,
      error: "Start date is required",
    };
  }

  const asIso = new Date(trimmed);
  if (!isNaN(asIso.getTime())) {
    return {
      ok: true as const,
      date: asIso,
      error: null,
    };
  }

  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/,
  );
  if (!match) {
    return {
      ok: false as const,
      date: null,
      error: "Use YYYY-MM-DD or YYYY-MM-DD HH:mm",
    };
  }

  const [, y, m, d, hh = "00", mm = "00"] = match;
  const date = new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(hh),
    Number(mm),
    0,
    0,
  );

  if (isNaN(date.getTime())) {
    return {
      ok: false as const,
      date: null,
      error: "Invalid date.",
    };
  }

  return {
    ok: true as const,
    date,
    error: null,
  };
}
