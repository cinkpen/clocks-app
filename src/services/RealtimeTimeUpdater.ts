let timerId: ReturnType<typeof setInterval> | null = null;

export function start(updateCallback: () => void, intervalMs: number = 1000): void {
  stop();
  timerId = setInterval(updateCallback, intervalMs);
  updateCallback();
}

export function stop(): void {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}
