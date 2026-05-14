import { useState, useMemo, useRef, useEffect } from 'react';
import { getAvailableCities } from '../services/TimezoneDataService';
import type { CityEntry } from '../services/TimezoneDataService';

interface CitySelectionProps {
  selectedCities: CityEntry[];
  onSelect: (city: CityEntry) => void;
}

export default function CitySelection({ selectedCities, onSelect }: CitySelectionProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const availableCities = getAvailableCities();

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return availableCities.filter(
      (c) =>
        !selectedCities.some((s) => s.timezoneId === c.timezoneId && s.name === c.name) &&
        (c.name.toLowerCase().includes(q) || c.timezoneId.toLowerCase().includes(q))
    );
  }, [query, availableCities, selectedCities]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: CityEntry) => {
    onSelect(city);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="city-selection" ref={wrapperRef}>
      <input
        className="city-selection__input"
        type="text"
        placeholder="Search for a city..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => query.trim() && setIsOpen(true)}
      />
      {isOpen && filtered.length > 0 && (
        <ul className="city-selection__dropdown">
          {filtered.map((city) => (
            <li
              key={`${city.timezoneId}|${city.name}`}
              className="city-selection__option"
              onClick={() => handleSelect(city)}
            >
              {city.name}
              <span className="city-selection__tz">{city.timezoneId}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
