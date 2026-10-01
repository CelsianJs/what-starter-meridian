import { mount, useComputed, useEffect, useSignal } from 'what-framework';

const STORAGE = 'meridian-plan';
const data = safeJson(decodeEntities(document.querySelector('#meridian-data')?.textContent || '')) || { sampleStops: [], guides: [] };
const fallback = new Map();

function PlannerIsland() {
  const storageStatus = useSignal('persistent');
  const saved = normalizePlan(safeJson(safeGet(STORAGE, storageStatus)));
  const stops = useSignal(saved.length ? saved : data.sampleStops);
  const zone = useSignal(safeGet('meridian-zone', storageStatus) || 'America/Halifax');
  const exportText = useSignal('');

  const days = useComputed(() => groupByDay(stops()));
  const localPreview = useComputed(() => formatLocal(zone()));

  useEffect(() => {
    safeSet(STORAGE, JSON.stringify(stops()), storageStatus);
    safeSet('meridian-zone', zone(), storageStatus);
  });

  function move(index, delta) {
    const next = [...stops()];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    stops(next.map((stop, order) => ({ ...stop, day: order < 2 ? 1 : order < 4 ? 2 : 3 })));
  }

  function reset() {
    stops(data.sampleStops);
    exportText('');
  }

  function exportPlan() {
    const payload = {
      name: 'Meridian sample route',
      timezone: zone(),
      exportedAt: new Date().toISOString(),
      stops: stops(),
    };
    exportText(JSON.stringify(payload, null, 2));
  }

  return (
    <>
      <aside class="panel controls">
        <p class="eyeline">Trip controls</p>
        <label>
          Timezone display
          <select value={zone} onInput={(event) => zone(event.target.value)}>
            {['America/Halifax', 'Atlantic/Reykjavik', 'Europe/Lisbon', 'America/New_York'].map((tz) => (
              <option value={tz}>{tz}</option>
            ))}
          </select>
        </label>
        <p aria-live="polite">Local preview: {() => localPreview()}</p>
        <button type="button" onClick={exportPlan}>Export JSON</button>
        <button type="button" onClick={reset}>Reset sample route</button>
        <p class="storage-note" hidden={() => storageStatus() === 'persistent'}>Storage is unavailable or blocked here. This tab keeps an in-memory plan, but it will not sync or survive a closed tab.</p>
        <div class="export">
          <label for="json-export">Portable plan JSON</label>
          <textarea id="json-export" rows="10" readonly value={exportText} placeholder="Use Export JSON to generate a portable local copy." />
        </div>
      </aside>
      <section aria-label="Itinerary stops">
        {() => days().map(([day, dayStops]) => (
          <article class="day-card">
            <p class="meta">Day {day}</p>
            <h2>{day === 1 ? 'Harbor arrival' : day === 2 ? 'Across the inner cut' : 'Outer shoal watch'}</h2>
            {dayStops.map(({ stop, index }) => (
              <div class="stop">
                <span class="meta">{stop.time}</span>
                <div>
                  <h3>{stop.title}</h3>
                  <p>{stop.place} · <a href={`/guides/${stop.guide}`}>{guideName(stop.guide)}</a></p>
                </div>
                <div class="stop-actions" aria-label={`Move ${stop.title}`}>
                  <button type="button" aria-label={`Move ${stop.title} earlier`} onClick={() => move(index, -1)}>↑</button>
                  <button type="button" aria-label={`Move ${stop.title} later`} onClick={() => move(index, 1)}>↓</button>
                </div>
              </div>
            ))}
          </article>
        ))}
      </section>
    </>
  );
}

function groupByDay(items) {
  const groups = new Map();
  items.forEach((stop, index) => {
    const day = Number(stop.day) || 1;
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day).push({ stop, index });
  });
  return [...groups.entries()].sort(([a], [b]) => a - b);
}

function guideName(slug) {
  return data.guides.find((guide) => guide.slug === slug)?.title || 'Guide';
}

function formatLocal(timeZone) {
  try {
    return new Intl.DateTimeFormat('en', {
      timeZone,
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(new Date('2026-06-18T14:30:00Z'));
  } catch {
    return 'Timezone unavailable';
  }
}

function normalizePlan(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((stop) =>
    stop && typeof stop.id === 'string' && typeof stop.title === 'string' && typeof stop.guide === 'string'
  ).map((stop, index) => ({
    id: stop.id,
    day: Math.min(5, Math.max(1, Number(stop.day) || Math.floor(index / 2) + 1)),
    time: typeof stop.time === 'string' ? stop.time : '09:00',
    title: stop.title,
    place: typeof stop.place === 'string' ? stop.place : 'Waypoint',
    guide: stop.guide,
  }));
}

function safeJson(value) {
  try { return value ? JSON.parse(value) : null; } catch { return null; }
}

function safeGet(key, status) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    status('memory');
    return fallback.get(key) || null;
  }
}

function safeSet(key, value, status) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    status('memory');
    fallback.set(key, value);
  }
}

function decodeEntities(value) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

const host = document.querySelector('#planner-island');
if (host) mount(<PlannerIsland />, host);
