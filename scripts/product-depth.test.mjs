import assert from 'node:assert/strict';
import { guides, planForGuide, moveStop } from '../src/content.mjs';
for (const guide of guides) {
  const plan = planForGuide(guide.slug);
  assert.ok(plan.length >= 3);
  assert.ok(plan.every(stop => stop.guide === guide.slug));
  const moved = moveStop(plan, 0, 1);
  assert.equal(moved[1].id, plan[0].id);
  assert.equal(moved[0].time, plan[0].time);
  assert.equal(moved[0].day, plan[0].day);
  assert.deepEqual(moveStop(plan, 0, -1), plan);
}
assert.deepEqual(planForGuide('unknown'), []);
console.log('ok guide plans and schedule-slot reorder');
