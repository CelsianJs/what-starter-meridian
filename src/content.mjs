export const site = {
  name: 'Meridian',
  tagline: 'Coastal trips planned like charts, not feeds.',
  description: 'A fictional coastal travel planner with guide pages and a browser-local itinerary.',
  repo: 'https://github.com/CelsianJs/what-starter-meridian',
  expectedUrl: 'https://what-starter-meridian-fae244da.vura.app',
};

export const guides = [
  {
    slug: 'cormorant-bay',
    alias: '/bay',
    title: 'Cormorant Bay',
    region: 'North Sound',
    timezone: 'America/Halifax',
    days: 3,
    tide: 'Morning ebb, evening glass',
    summary: 'A blue-paper harbor with ferry horns, cedar paths and tide-table dinners.',
    color: '#256c91',
    legs: ['North quay arrival', 'Fogbell cedar walk', 'Lamp room supper'],
    notes: ['Best arrival window is 10:40–12:10 local.', 'Carry a wind shell for the western headland.', 'Harbor cafés close early outside festival week.'],
  },
  {
    slug: 'saltline-reach',
    alias: '/reach',
    title: 'Saltline Reach',
    region: 'Outer Shoal',
    timezone: 'Atlantic/Reykjavik',
    days: 4,
    tide: 'Long daylight, low swell',
    summary: 'A sparse island chain for sketching lighthouses, basalt pools and midnight lunches.',
    color: '#0e5d77',
    legs: ['Basalt pool survey', 'Lantern trail', 'North beach smokehouse'],
    notes: ['Schedule extra transfer time after southwesterlies.', 'The public sauna is quiet before 09:00.', 'No rental counters after the last ferry.'],
  },
  {
    slug: 'blueglass-canal',
    alias: '/canal',
    title: 'Blueglass Canal',
    region: 'Inner Cut',
    timezone: 'Europe/Lisbon',
    days: 2,
    tide: 'Still water, market bells',
    summary: 'A compact canal city of glazed tile, boat sheds and late lemon custards.',
    color: '#2b88a2',
    legs: ['Tile quay loop', 'Archive pier', 'Custard market'],
    notes: ['Use footbridges at low tide only.', 'The archive pier needs advance reservation.', 'Late dinners start after 20:30 local.'],
  },
];

export const sampleStops = [
  { id: 'arrive', day: 1, time: '09:40', title: 'Arrive at North Quay', place: 'Cormorant Bay', guide: 'cormorant-bay' },
  { id: 'cedar', day: 1, time: '13:10', title: 'Walk the Fogbell Cedars', place: 'Headland track', guide: 'cormorant-bay' },
  { id: 'chart', day: 2, time: '10:15', title: 'Sketch the tide chart room', place: 'Harbor archive', guide: 'blueglass-canal' },
  { id: 'ferry', day: 2, time: '16:45', title: 'Evening ferry to Saltline', place: 'Outer pier', guide: 'saltline-reach' },
  { id: 'basalt', day: 3, time: '08:30', title: 'Basalt pool survey', place: 'North shelf', guide: 'saltline-reach' },
];

export const routes = [
  { path: '/', title: 'Meridian travel planner' },
  { path: '/guides', title: 'Coastal guides' },
  { path: '/planner', title: 'Itinerary planner' },
  { path: '/build', title: 'Build journal' },
  ...guides.flatMap((guide) => [
    { path: `/guides/${guide.slug}`, title: guide.title },
    { path: guide.alias, title: `${guide.title} alias` },
  ]),
  { path: '/404', title: 'Not found' },
];

const legDetails = {
  'cormorant-bay': [
    ['North quay arrival', '11:00', 'Allow 45 minutes from the ferry ramp to the harbor rooms. The quay has step-free access; use the covered eastern path if the wind turns.'],
    ['Fogbell cedar walk', '14:00', 'A 2-hour out-and-back on uneven roots. Carry water and a wind shell; the sheltered loop is the shorter alternative.'],
    ['Lamp room supper', '18:30', 'Leave 30 minutes to return through the old quay. This sample stop is a meal break, not a reservation or restaurant listing.'],
  ],
  'saltline-reach': [
    ['Basalt pool survey', '09:00', 'Spend 90 minutes along the marked shore path. Stay above the wet rock line; the pools are a viewing stop, not a swimming recommendation.'],
    ['Lantern trail', '13:00', 'Allow 3 hours for the ridge loop and carry lunch. Turn back at the lower beacon if visibility falls; there is no staffed shelter in this fictional route.'],
    ['North beach smokehouse', '18:00', 'A 45-minute sheltered walk from the harbor. Keep transfer time flexible and check real services before adapting this sample into a trip.'],
  ],
  'blueglass-canal': [
    ['Tile quay loop', '10:00', 'A 75-minute level route along the canal edge. Use the permanent road bridge rather than relying on the seasonal footbridge.'],
    ['Archive pier', '14:00', 'Plan a 2-hour indoor stop and a 20-minute walk from the quay. The fictional archive illustrates a reservation-dependent leg; verify access in a real itinerary.'],
    ['Custard market', '17:00', 'Allow an hour for the market loop. Keep an unstructured meal break afterward instead of stacking another transfer onto the last day.'],
  ],
};
for (const guide of guides) {
  guide.logistics = legDetails[guide.slug].map(([title, time, note]) => ({ title, time, note }));
}

export function planForGuide(slug) {
  const guide = guides.find(item => item.slug === slug);
  return guide ? guide.logistics.map((leg, index) => ({ id: `${slug}-${index}`, day: Math.min(guide.days, index + 1), time: leg.time, title: leg.title, place: guide.region, guide: slug })) : [];
}

// Schedule slots own day/time; moving an activity does not reorder the clock.
export function moveStop(items, index, delta) {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  next[index] = { ...items[target], day: items[index].day, time: items[index].time };
  next[target] = { ...items[index], day: items[target].day, time: items[target].time };
  return next;
}
