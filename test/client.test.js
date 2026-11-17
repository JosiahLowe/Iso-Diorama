import test from 'node:test';
import assert from 'node:assert/strict';
import { scene } from '../src/scene.js';
import { startWandering } from '../src/client.js';

// Minimal DOM harness exercises the real animation controller and SVG node
// ordering without a browser dependency or substituting the motion engine.
class Element {
  constructor(attrs={}) { this.attrs=attrs; this.children=[]; this.parentNode=null; }
  getAttribute(name) { return this.attrs[name]??null; }
  setAttribute(name,value) { this.attrs[name]=String(value); }
  get firstElementChild() { return this.children[0]??null; }
  get nextElementSibling() { return this.parentNode?.children[this.parentNode.children.indexOf(this)+1]??null; }
  appendChild(child) { return this.insertBefore(child,null); }
  insertBefore(child,before) {
    if (child.parentNode) child.parentNode.children.splice(child.parentNode.children.indexOf(child),1);
    const index=before?this.children.indexOf(before):this.children.length;
    this.children.splice(index,0,child); child.parentNode=this; return child;
  }
  find(predicate) {
    if (predicate(this)) return this;
    for (const child of this.children) { const found=child.find(predicate); if (found) return found; }
    return null;
  }
  querySelector(selector) {
    const part=selector.match(/data-part="(.*?)"/)[1];
    return this.find(e=>e.attrs['data-part']===part);
  }
}

test('client animates the existing pieces, splits occlusion layers, and pauses cleanly',()=>{
  const layer=new Element({id:'objects'});
  for (const o of scene.objects) {
    const element=new Element({id:o.id,transform:'translate(0 0)'});
    if (o.kind==='church') for (const part of ['walls','roof','tower','porch','steps']) element.appendChild(new Element({'data-part':part}));
    if (['church','character','tree','devil'].includes(o.kind)) layer.appendChild(element);
    else { const mask=new Element(); mask.appendChild(element); layer.appendChild(mask); }
  }
  const listeners=new Map(),mediaListeners=new Map(),frames=new Map();
  let nextFrame=0;
  const media={matches:false,addEventListener:(k,f)=>mediaListeners.set(k,f),removeEventListener:k=>mediaListeners.delete(k)};
  const document={hidden:false,getElementById:id=>layer.find(e=>e.attrs.id===id),createElementNS:()=>new Element(),
    addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k)};
  const window={matchMedia:()=>media,requestAnimationFrame:f=>{frames.set(++nextFrame,f);return nextFrame;},cancelAnimationFrame:id=>frames.delete(id)};
  const controller=startWandering(document,window);
  assert.equal(frames.size,1);
  assert.ok(document.getElementById('church-porch'));
  assert.ok(document.getElementById('church-steps'));
  const figure=document.getElementById('figure-beige'),initial=figure.getAttribute('transform');
  let peeks=0;
  for (let i=0;i<600;i++) {
    const [id,callback]=frames.entries().next().value; frames.delete(id); callback(i*1000/30);
    assert.equal(frames.size,1);
    const devil=document.getElementById('forest-devil');
    if (devil?.getAttribute('visibility')==='visible') {
      peeks++;
      assert.equal(devil.parentNode.parentNode.getAttribute('id'),controller.peeker.pose.tree.id);
      assert.ok(devil.parentNode.getAttribute('clip-path').startsWith('url(#devil-peek-'));
    }
  }
  assert.ok(peeks>0,'The devil should peek while the foreground figures wander');
  assert.notEqual(figure.getAttribute('transform'),initial);
  assert.equal(document.getElementById('figure-beige'),figure,'Keep the same SVG node');
  document.hidden=true; listeners.get('visibilitychange')(); assert.equal(frames.size,0);
  document.hidden=false; listeners.get('visibilitychange')(); assert.equal(frames.size,1);
  media.matches=true; mediaListeners.get('change')(); assert.equal(frames.size,0);
  media.matches=false; mediaListeners.get('change')(); assert.equal(frames.size,1);
  controller.stop(); assert.equal(frames.size,0);
  assert.equal(listeners.size,0); assert.equal(mediaListeners.size,0);
});
