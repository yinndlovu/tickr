export type Theme = {
  background: string;
  card: string;
  text: string;
  subtext: string;
  primary: string;
  accent: string;
};

export const LightTheme: Theme = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#1E293B",
  subtext: "#64748B",
  primary: "#6366F1",
  accent: "#E2E8F0",
};

export const DarkTheme: Theme = {
  background: "#0F172A",
  card: "#1E293B",
  text: "#F1F5F9",
  subtext: "#94A3B8",
  primary: "#818CF8",
  accent: "#334155",
};
