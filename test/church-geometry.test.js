import test from 'node:test';
import assert from 'node:assert/strict';
import { churchModel as m, mainRoofHeight, porchRoofHeight, stairTreads, crossOutline } from '../src/church-model.js';
import { project } from '../src/geometry.js';
import { Church } from '../src/components.js';

test('the entrance threshold and rear edge of the upper tread coincide in 3D', () => {
  const [a,b] = stairTreads()[0];
  assert.equal((a[0]+b[0])/2,m.center);
  assert.equal(a[1],m.porch.front);
  assert.equal(b[1],m.porch.front);
  assert.equal(a[2],m.door.threshold);
  assert.equal(b[2],m.door.threshold);
  const threshold = project({u:m.center,v:m.porch.front,z:m.door.threshold});
  const left=project({u:a[0],v:a[1],z:a[2]}), right=project({u:b[0],v:b[1],z:b[2]});
  assert.ok(Math.abs(threshold.x-(left.x+right.x)/2)<1e-9);
  assert.ok(Math.abs(threshold.y-(left.y+right.y)/2)<1e-9);
});

test('stairs descend continuously to the ground without offsets between treads', () => {
  const treads=stairTreads();
  for (let i=1;i<treads.length;i++) {
    assert.equal(treads[i][0][1],treads[i-1][3][1]);
    assert.equal(treads[i-1][0][2]-treads[i][0][2],m.stair.rise);
  }
  assert.equal(treads.at(-1)[0][2]-m.stair.rise,0);
});

test('gable walls meet the underside of each roof on both sides', () => {
  for (const sign of [-1,1]) {
    const u=m.center+sign*m.porch.halfWidth;
    assert.equal(porchRoofHeight(u)-m.porch.skin,m.porch.eave);
  }
  assert.equal(mainRoofHeight(0),mainRoofHeight(m.main.width));
  assert.equal(porchRoofHeight(m.center)-m.porch.skin,m.porch.ridge);
});

test('cross is a single connected, centered silhouette seated on the spire', () => {
  const outline=crossOutline();
  const left=Math.min(...outline.map(p=>p[0])),right=Math.max(...outline.map(p=>p[0]));
  assert.equal((left+right)/2,m.center);
  assert.equal(Math.min(...outline.map(p=>p[2])),m.tower.apex);
  assert.equal(Math.max(...outline.map(p=>p[2]))-m.tower.apex,m.cross.height);
  assert.ok(outline.every(p=>p[1]===(m.tower.front+m.tower.back)/2));
  const svg=Church({id:'test-church',position:{u:0,v:0}});
  const cross=svg.match(/<g data-part="cross">(.*?)<\/g>/)[1];
  assert.equal((cross.match(/<polygon/g)||[]).length,1);
});
