export function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isStale(asOf: Date | string, staleAfterMinutes: number) {
  const timestamp = typeof asOf === "string" ? new Date(asOf) : asOf;
  return Date.now() - timestamp.getTime() > staleAfterMinutes * 60 * 1000;
}
