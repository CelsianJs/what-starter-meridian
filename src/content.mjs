export const site = {
  name: 'Meridian',
  tagline: 'Coastal trips planned like charts, not feeds.',
  description: 'A fictional travel planner starter with static guide pages and a local-only itinerary island.',
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
