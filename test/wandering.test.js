import test from 'node:test';
import assert from 'node:assert/strict';
import { scene } from '../src/scene.js';
import { unproject, project } from '../src/geometry.js';
import { createCollisionWorld, canTravel, Navigator, distance, obstacleBlocks } from '../src/navigation.js';
import { WanderSimulation } from '../src/wander.js';

function seeded(seed) {
  return ()=>{ seed=(Math.imul(1664525,seed)+1013904223)>>>0; return seed/4294967296; };
}

test('swept collision rejects complete crossings even when both endpoints are outside',()=>{
  const a={u:-100,v:0},b={u:100,v:0};
  for (const obstacle of [
    {shape:'circle',u:0,v:0,radius:8},
    {shape:'rect',minU:-5,maxU:5,minV:-20,maxV:20},
    {shape:'capsule',a:{u:0,v:-30},b:{u:0,v:30},radius:3}
  ]) {
    assert.ok(obstacleBlocks(a,b,22,obstacle));
    assert.ok(!obstacleBlocks({u:-100,v:80},{u:100,v:80},22,obstacle));
  }
});

test('routes detour around the church without cutting inflated corners',()=>{
  const world=createCollisionWorld(scene),nav=new Navigator(world,22);
  const start=unproject(405,540),goal=unproject(747,617);
  assert.ok(canTravel(start,start,22,world));
  assert.ok(canTravel(goal,goal,22,world));
  assert.ok(!canTravel(start,goal,22,world));
  const route=nav.findPath(start,goal);
  assert.ok(route.length>1);
  let previous=start;
  for (const waypoint of route) {
    assert.ok(canTravel(previous,waypoint,22,world)); previous=waypoint;
  }
  assert.ok(distance(previous,goal)<1e-9);
});

test('five foreground figures wander without obstacle crossings, overlaps, or getting stuck',()=>{
  for (const seed of [17,818,2026]) {
    const sim=new WanderSimulation(scene,seeded(seed));
    assert.equal(sim.agents.length,5);
    const traveled=sim.agents.map(()=>0);
    for (let step=0;step<30*180;step++) {
      const previous=sim.agents.map(a=>({...a.position}));
      sim.update(step%173===0?.4:1/30); // Include occasional long frames.
      sim.agents.forEach((a,i)=>{
        assert.ok(project(a.position).y-Math.SQRT1_2*a.radius>scene.wandering.minY);
        assert.ok(canTravel(previous[i],a.position,a.radius,sim.world),`${a.id} crossed an obstacle`);
        traveled[i]+=distance(previous[i],a.position);
        for (const b of sim.agents) if (a!==b) {
          assert.ok(distance(a.position,b.position)>a.radius+b.radius,`${a.id} overlapped ${b.id}`);
        }
      });
    }
    assert.ok(traveled.every(d=>d>500),`Stalled figure with seed ${seed}: ${traveled}`);
  }
});

test('blocked movement waits and replans without teleporting or tunneling after a long stall',()=>{
  const sim=new WanderSimulation(scene,seeded(7)),actor=sim.agents[0];
  const start={...actor.position};
  actor.pause=0;
  actor.route=[{u:85,v:-80}]; // Deliberately aim through the solid church.
  for (let i=0;i<60;i++) {
    const before={...actor.position};
    sim.update(1/30);
    assert.ok(canTravel(before,actor.position,actor.radius,sim.world));
  }
  const before={...actor.position};
  sim.update(3600);
  assert.ok(distance(before,actor.position)<=actor.speed*.25+1e-7);
  assert.ok(canTravel(before,actor.position,actor.radius,sim.world));
  assert.ok(distance(start,actor.position)<actor.speed*3);
});
