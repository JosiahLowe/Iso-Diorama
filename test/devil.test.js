import test from 'node:test';
import assert from 'node:assert/strict';
import { DevilPeeker } from '../src/devil.js';
import { scene } from '../src/scene.js';
import { Tree } from '../src/components.js';

test('all objects are opaque and forest trunks use a solid brown fill',()=>{
  assert.ok(scene.objects.every(o=>(o.opacity??1)===1));
  for (const tree of scene.objects.filter(o=>o.kind==='tree')) {
    assert.equal(tree.opacity??1,1);
    const markup=Tree(tree);
    assert.ok(markup.includes('opacity="1"'));
    assert.ok(!markup.includes('stop-opacity'));
    assert.ok(markup.includes('data-part="trunk"><path'));
    assert.ok(markup.includes('fill="#8e6a45"'));
  }
});

test('the devil alternates between hidden waits and gradual peeks at different trees',()=>{
  let seed=34;
  const random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
  const peeker=new DevilPeeker(scene,random),visits=[],waits=[];
  let previous=peeker.pose;
  assert.equal(previous.visible,false);
  for (let i=0;i<9000;i++) {
    peeker.update(.05);
    const pose=peeker.pose;
    if (pose.visible && !previous.visible) {
      visits.push(pose.tree.id);
      assert.notEqual(pose.tree.id,previous.tree?.id);
      assert.equal(pose.offset,-12,'Start completely behind the reveal edge');
    }
    if (!pose.visible && previous.visible) waits.push(peeker.duration);
    if (pose.visible && previous.visible) {
      assert.equal(pose.tree.id,previous.tree.id,'Never switch trees while visible');
      assert.ok(Math.abs(pose.offset-previous.offset)<4,'Peek smoothly rather than appearing abruptly');
    }
    assert.ok(pose.offset>=-12 && pose.offset<=21);
    previous=pose;
  }
  assert.ok(visits.length>15);
  assert.ok(new Set(visits).size>=3);
  assert.ok(waits.every(t=>t>=7 && t<=17));
  assert.ok(new Set(waits).size>3,'Vary the time between appearances');
});
