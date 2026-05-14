import { getFormattedTime, getFormattedDate } from '../services/TimeFormattingUtility';
import type { CityEntry } from '../services/TimezoneDataService';

interface TimezoneDisplayItemProps {
  city: CityEntry;
  now: Date;
  onRemove: (city: CityEntry) => void;
}

export default function TimezoneDisplayItem({
  city,
  now,
  onRemove,
}: TimezoneDisplayItemProps) {
  const formattedTime = getFormattedTime(city.timezoneId, now);
  const formattedDate = getFormattedDate(city.timezoneId, now);

  return (
    <div className="timezone-item">
      <div className="timezone-item__info">
        <span className="timezone-item__city">{city.name}</span>
        <span className="timezone-item__date">{formattedDate}</span>
      </div>
      <span className="timezone-item__time">{formattedTime}</span>
      <button
        className="timezone-item__remove"
        onClick={() => onRemove(city)}
        aria-label={`Remove ${city.name}`}
        title={`Remove ${city.name}`}
      >
        &times;
      </button>
    </div>
  );
}
