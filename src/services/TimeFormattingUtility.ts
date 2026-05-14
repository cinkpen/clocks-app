export function getFormattedTime(timezoneId: string, date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezoneId,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

export function getFormattedDate(timezoneId: string, date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezoneId,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/** @deprecated Use getFormattedTime instead */
export const getFormattedCurrentTime = getFormattedTime;
