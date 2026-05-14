import { useState, useEffect, useCallback, useRef } from 'react';
import { loadSelectedCities, saveSelectedCities } from '../services/TimezonePersistenceService';
import { start as startUpdater, stop as stopUpdater } from '../services/RealtimeTimeUpdater';
import type { CityEntry } from '../services/TimezoneDataService';
import TimezoneDisplayItem from './TimezoneDisplayItem';
import CitySelection from './CitySelection';

const DEFAULT_CITIES: CityEntry[] = [
  { name: 'New York', timezoneId: 'America/New_York' },
  { name: 'London', timezoneId: 'Europe/London' },
  { name: 'Tokyo', timezoneId: 'Asia/Tokyo' },
];

export default function TimezoneList() {
  const [selectedCities, setSelectedCities] = useState<CityEntry[]>([]);
  const [now, setNow] = useState(new Date());
  const loaded = useRef(false);

  useEffect(() => {
    const saved = loadSelectedCities();
    setSelectedCities(saved ?? DEFAULT_CITIES);
    loaded.current = true;
  }, []);

  useEffect(() => {
    startUpdater(() => setNow(new Date()), 1000);
    return () => stopUpdater();
  }, []);

  useEffect(() => {
    if (loaded.current) {
      saveSelectedCities(selectedCities);
    }
  }, [selectedCities]);

  const handleAddCity = useCallback((city: CityEntry) => {
    setSelectedCities((prev) => {
      if (prev.some((c) => c.timezoneId === city.timezoneId && c.name === city.name)) return prev;
      return [...prev, city];
    });
  }, []);

  const handleRemove = useCallback((city: CityEntry) => {
    setSelectedCities((prev) =>
      prev.filter((c) => !(c.timezoneId === city.timezoneId && c.name === city.name))
    );
  }, []);

  return (
    <div className="timezone-list">
      <h1 className="timezone-list__title">Clocks</h1>
      <CitySelection
        selectedCities={selectedCities}
        onSelect={handleAddCity}
      />
      <div className="timezone-list__items">
        {selectedCities.length === 0 ? (
          <p className="timezone-list__empty">No cities selected. Add a city above.</p>
        ) : (
          selectedCities.map((city) => (
            <TimezoneDisplayItem
              key={`${city.timezoneId}|${city.name}`}
              city={city}
              now={now}
              onRemove={handleRemove}
            />
          ))
        )}
      </div>
    </div>
  );
}
