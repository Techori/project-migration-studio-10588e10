// Registration for the Startup Funding Programme closes at the end of
// 10 November 2026 (India Standard Time, UTC+5:30).
export const registrationDeadline = new Date("2026-11-10T23:59:59+05:30");

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  closed: boolean;
}

export function countdownParts(now: Date, deadline: Date = registrationDeadline): CountdownParts {
  const remaining = deadline.getTime() - now.getTime();
  if (remaining <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, closed: true };
  const seconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    closed: false,
  };
}
