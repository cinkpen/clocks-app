import citiesData from '../data/cities.json';

export interface CityEntry {
  name: string;
  timezoneId: string;
}

let cachedCities: CityEntry[] | null = null;

export function getAvailableCities(): CityEntry[] {
  if (!cachedCities) {
    cachedCities = citiesData as CityEntry[];
  }
  return cachedCities;
}
