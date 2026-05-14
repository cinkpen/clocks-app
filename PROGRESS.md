# PROGRESS.md

## 2026-05-14 — Core Timezone Display and Real-time Update

**Story:** As a user, I want to see a list of my selected cities and their current local times so I can track timezones at a glance.

### What was done
- Scaffolded React + TypeScript project with Vite
- Created service layer: TimezoneDataService, TimezonePersistenceService, RealtimeTimeUpdater, TimeFormattingUtility
- Built `TimezoneDisplayItem` component showing city name, formatted date, and real-time clock (HH:MM:SS AM/PM)
- Built `TimezoneList` component managing selected timezones with persistence via localStorage
- Built `CitySelection` component with search/filter dropdown for adding cities
- Applied dark mode aesthetic with CSS custom properties
- Added responsive breakpoints for mobile (≤480px)
- Default cities (New York, London, Tokyo) shown on first visit
- Times update every second via client-side setInterval
- Verified: TypeScript type-check passes, Vite production build succeeds

### Files changed
- `src/services/TimezoneDataService.ts` — static city/timezone data loader
- `src/services/TimezonePersistenceService.ts` — localStorage save/load
- `src/services/RealtimeTimeUpdater.ts` — setInterval-based 1s tick
- `src/services/TimeFormattingUtility.ts` — Intl.DateTimeFormat helper
- `src/data/cities.json` — curated list of 20 cities with IANA timezone IDs
- `src/components/TimezoneDisplayItem.tsx` — single city + time display
- `src/components/TimezoneList.tsx` — list orchestrator with persistence
- `src/components/CitySelection.tsx` — search input with dropdown
- `src/App.tsx` — wired to TimezoneList
- `src/App.css` — full dark mode styling and responsive layout
- `src/index.css` — minimal reset
- `index.html` — updated title
- `tsconfig.app.json` — enabled resolveJsonModule

### Decisions
- Used client-side-only approach: no backend needed for time display (per architecture decision)
- Used `Intl.DateTimeFormat` for timezone-aware formatting — no external date library required
- Dark mode applied via CSS custom properties for consistency
- Default of 3 cities shown on first visit so the UI is immediately useful

## 2026-05-14 — Real-time Second-by-Second Time Updates

**Story:** As a user, I want the displayed times to update every second so I always see accurate, current time.

### What was done
- Verified the existing `RealtimeTimeUpdater` service: `setInterval` fires every 1000ms, calling `setNow(new Date())` in `TimezoneList`
- Confirmed timer lifecycle is correct: cleanup via `stop()` in `useEffect` return prevents memory leaks
- Updated `TimeFormattingUtility` to accept an optional `Date` parameter (`getFormattedTime`, `getFormattedDate`) instead of always using `new Date()` internally
- Updated `TimezoneDisplayItem` to use `TimeFormattingUtility` methods instead of inline `Intl.DateTimeFormat` construction, aligning with the architecture manifest
- Verified performance: single timer instance for all items, `Intl.DateTimeFormat` creation per-render is lightweight for the expected list size (~20 cities max)
- TypeScript type-check passes, Vite production build succeeds

### Files changed
- `src/services/TimeFormattingUtility.ts` — added `getFormattedTime(date?)` and `getFormattedDate(date?)` with optional Date parameter
- `src/components/TimezoneDisplayItem.tsx` — uses `TimeFormattingUtility` methods instead of inline formatting
- `PROGRESS.md` — this entry

### Decisions
- Kept the single-timer architecture: one `setInterval` in `TimezoneList` updates a shared `now` state, all items re-render from that single state change — avoids N timers for N cities
- Did not memoize `Intl.DateTimeFormat` instances: creation cost is negligible for the expected list size, and memoization would add complexity without measurable benefit
- Deprecated old `getFormattedCurrentTime` export for backward compatibility while new `getFormattedTime` is preferred

## 2026-05-14 — Add City Search and Selection

**Story:** As a user, I want to be able to add new cities to my tracking list so I can customize which timezones I monitor.

### What was done
- Expanded `cities.json` from 20 to 80 cities covering all major world regions (Americas, Europe, Middle East, Asia, Africa, Oceania)
- Refactored data model from timezone-ID-only state (`string[]`) to city-entry state (`CityEntry[]`) to support multiple cities per timezone (e.g., both New York and Miami display independently despite sharing `America/New_York`)
- Updated `TimezonePersistenceService` to save/load `CityEntry[]` objects (name + timezoneId) instead of plain timezone ID strings
- Updated `TimezoneList` to use `CityEntry[]` state with dedup by both name and timezoneId
- Updated `CitySelection` to work with `CityEntry[]` model, filtering out already-selected city entries
- Updated `TimezoneDisplayItem` to accept a `CityEntry` object directly
- Verified in browser: search/filter works, adding cities works, multiple cities per timezone work, real-time updates continue for newly added cities
- TypeScript type-check passes, Vite production build succeeds

### Files changed
- `src/data/cities.json` — expanded from 20 to 80 cities with comprehensive global coverage
- `src/services/TimezonePersistenceService.ts` — refactored to save/load `CityEntry[]` instead of `string[]`
- `src/components/TimezoneList.tsx` — state model changed from `string[]` to `CityEntry[]`
- `src/components/CitySelection.tsx` — updated to filter by city entries, dedup by name+timezoneId
- `src/components/TimezoneDisplayItem.tsx` — accepts `CityEntry` object instead of separate cityName/timezoneId props
- `PROGRESS.md` — this entry

### Decisions
- Used `CityEntry` (name + timezoneId) as the state unit instead of plain timezone IDs, enabling users to track multiple cities in the same timezone (e.g., New York and Miami)
- Kept static city data file per architecture decision — 80 cities provides comprehensive coverage without needing a runtime library
- Used composite key (`timezoneId|name`) for React list rendering to ensure uniqueness when multiple cities share a timezone
- Persistence key changed from `clocks-selected-timezones` to `clocks-selected-cities` to store richer data

## 2026-05-14 — Verification: City Search and Selection

**Story:** As a user, I want to be able to add new cities to my tracking list so I can customize which timezones I monitor.

### What was done
- Verified all story acceptance criteria in browser using agent-browser automation
- Confirmed TypeScript type-check passes and Vite production build succeeds
- Tested city search: typing "Paris" filters the dropdown correctly, showing city name + timezone ID
- Tested city addition: clicking "Paris" in dropdown adds it to the tracked list with real-time local time
- Tested duplicate prevention: searching for "Paris" again does not show it in dropdown (already selected)
- Tested shared-timezone cities: adding "Miami" (America/New_York) works independently alongside "New York" (same timezone)
- Tested real-time updates: confirmed seconds advance every second for all displayed cities including newly added ones
- Tested city removal: remove button (×) correctly removes a city from the list

### Files changed
- `PROGRESS.md` — this verification entry

### Decisions
- All story tasks verified as complete; no code changes needed
- City search/add/remove flow works end-to-end as expected

## 2026-05-14 — Save Selected Timezones with Persistence

**Story:** As a user, I want my selected timezones to be saved so I don't have to re-add them every time I open the application.

### What was done
- Enhanced `TimezonePersistenceService` with data shape validation (`isValidCityEntry`) to reject entries that are valid JSON but not proper `{name, timezoneId}` objects
- Added try/catch around all `localStorage` access (both getItem and setItem) to handle environments where localStorage is unavailable or throws (quota exceeded, restricted contexts)
- Changed `loadSelectedCities()` return type from `CityEntry[]` to `CityEntry[] | null` to distinguish "never saved" (null) from "explicitly saved empty list" ([]), enabling correct default behavior on first visit vs. empty-list persistence
- Fixed `TimezoneList` to persist all state changes after initial load using a `loaded` ref, including the empty-list case when a user removes all cities — previously the `length > 0` guard prevented saving an empty list, causing removed cities to reappear on reload
- Verified: TypeScript type-check passes, Vite production build succeeds

### Files changed
- `src/services/TimezonePersistenceService.ts` — added data validation, localStorage error handling, null return for never-saved
- `src/components/TimezoneList.tsx` — uses `loaded` ref to skip save on initial render, persists all changes including empty list
- `PROGRESS.md` — this entry

### Decisions
- Used `null` return to distinguish "never saved" from "saved empty" rather than a sentinel value — this is the idiomatic localStorage pattern (`getItem` returns `null` when key doesn't exist)
- Used a ref (`loaded`) instead of state to track initialization because state-based approaches cause an extra render cycle; the ref is checked synchronously within the save effect
- Silently swallow localStorage errors on both read and write — the app degrades gracefully to defaults when storage is unavailable, which is appropriate for a client-only tool with no backend sync

## 2026-05-14 — Remove Cities from Tracking List

**Story:** As a user, I want to be able to remove cities from my tracking list so I can manage my monitored timezones.

### What was done
- Verified all four story tasks are already implemented from prior stories:
  - Remove button (`×`) rendered in `TimezoneDisplayItem` with `aria-label` and `title` for accessibility
  - `handleRemove` callback in `TimezoneList` filters the city from state by matching both `name` and `timezoneId`
  - State update triggers re-render and persists via `saveSelectedCities` (including empty-list case)
  - List re-renders correctly after removal — React reconciliation via `key` prop handles DOM update
- Verified acceptance criteria: clicking remove button next to a city removes it from display and persists across sessions
- TypeScript type-check passes, Vite production build succeeds

### Files changed
- `PROGRESS.md` — this entry

### Decisions
- No code changes needed — the remove feature was implemented as part of earlier stories (city search/selection and persistence hardening)
- The `handleRemove` uses composite key matching (`timezoneId + name`) to correctly handle cities that share the same timezone

## 2026-05-14 — Re-verification: Add City Search and Selection

**Story:** As a user, I want to be able to add new cities to my tracking list so I can customize which timezones I monitor.

### What was done
- Re-verified all story tasks and acceptance criteria against current codebase
- Confirmed TypeScript type-check passes (`tsc --noEmit` clean)
- Confirmed Vite production build succeeds (25 modules, 197KB JS, 3.76KB CSS)
- No code changes required — all tasks already implemented and committed

### Files changed
- `PROGRESS.md` — this re-verification entry

### Decisions
- Story was already fully implemented in prior commits (ef8517a, eef10e4)
- All acceptance criteria met: search input filters cities, selecting a city adds it to the list with real-time time display, duplicate prevention works, persistence works
