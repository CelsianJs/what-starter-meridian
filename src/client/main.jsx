import { mount, useComputed, useEffect, useSignal } from 'what-framework';
import { planForGuide, moveStop } from '../content.mjs';

const STORAGE = 'meridian-plan';
const data = safeJson(decodeEntities(document.querySelector('#meridian-data')?.textContent || '')) || { sampleStops: [], guides: [] };
const fallback = new Map();

function PlannerIsland() {
  const storageStatus = useSignal('persistent');
  const saved = normalizePlan(safeJson(safeGet(STORAGE, storageStatus)));
  const selected = data.guides.find(guide => guide.slug === new URLSearchParams(location.search).get('guide'));
  const guidePlan = selected ? planForGuide(selected.slug) : [];
  const stops = useSignal(saved.length ? saved : guidePlan.length ? guidePlan : data.sampleStops);
  const zone = useSignal(safeGet('meridian-zone', storageStatus) || selected?.timezone || 'America/Halifax');
  const exportText = useSignal('');

  const days = useComputed(() => groupByDay(stops()));
  const localPreview = useComputed(() => formatLocal(zone()));

  useEffect(() => {
    safeSet(STORAGE, JSON.stringify(stops()), storageStatus);
    safeSet('meridian-zone', zone(), storageStatus);
  });

  function move(index, delta) {
    stops(moveStop(stops(), index, delta));
    exportText('');
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
        {selected ? <div><p>{selected.title} route selected. Existing saved stops are kept until you choose this route.</p><button type="button" onClick={() => { stops(guidePlan); exportText(''); }}>Use {selected.title} route</button></div> : null}
        <p>Move activities between fixed day/time slots. Times stay in schedule order.</p>
        <label>
          Timezone reference
          <select value={zone} onInput={(event) => { zone(event.target.value); exportText(''); }}>
            {['America/Halifax', 'Atlantic/Reykjavik', 'Europe/Lisbon', 'America/New_York'].map((tz) => (
              <option value={tz}>{tz}</option>
            ))}
          </select>
        </label>
        <p aria-live="polite">Reference instant (18 Jun 2026, 14:30 UTC): {() => localPreview()}. Stop slots remain destination-local times.</p>
        <button type="button" onClick={exportPlan}>Export JSON</button>
        <button type="button" onClick={reset}>Reset sample route</button>
        <p class="storage-note" hidden={() => storageStatus() === 'persistent'}>Storage is unavailable or blocked here. This tab keeps an in-memory plan, but it will not sync or survive a closed tab.</p>
        <div class="export">
          <label for="json-export">Portable plan JSON</label>
          <textarea id="json-export" rows="10" readonly value={exportText} placeholder="Use Export JSON to generate a portable local copy." />
        </div>
      </aside>
      <section aria-label="Itinerary stops">
        <div class="panel route-ledger"><p class="eyeline">Current route · schedule order</p><svg class="route-map" viewBox="0 0 400 120" role="img" aria-label="Current itinerary route">
          <polyline points={() => stops().map((stop,index) => `${44+index*312/Math.max(1,stops().length-1)},${94-(stop.day-1)*24+(index%2)*10}`).join(' ')} fill="none" stroke="currentColor" stroke-width="3" />
          {() => stops().map((stop,index) => <g><circle cx={44+index*312/Math.max(1,stops().length-1)} cy={94-(stop.day-1)*24+(index%2)*10} r="6" fill={data.guides.find(guide => guide.slug===stop.guide)?.color || '#1f6f92'} /><text x={44+index*312/Math.max(1,stops().length-1)} y={82-(stop.day-1)*24+(index%2)*10} text-anchor="middle">D{stop.day}</text></g>)}
        </svg></div>
        {() => days().map(([day, dayStops]) => (
          <article class="day-card">
            <p class="meta">Day {day}</p>
            <h2>Day {day} route</h2>
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
if (host) {
  document.documentElement.classList.add('js-ready');
  mount(<PlannerIsland />, host);
}
