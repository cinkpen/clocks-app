import type { CityEntry } from './TimezoneDataService';

const STORAGE_KEY = 'clocks-selected-cities';

function isValidCityEntry(value: unknown): value is CityEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).name === 'string' &&
    typeof (value as Record<string, unknown>).timezoneId === 'string'
  );
}

export function saveSelectedCities(cities: CityEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
  } catch {
    // localStorage may be unavailable (quota exceeded, restricted context)
  }
}

export function loadSelectedCities(): CityEntry[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const validated = parsed.filter(isValidCityEntry);
    return validated;
  } catch {
    return null;
  }
}
