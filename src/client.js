import { scene } from './scene.js';
import { project } from './geometry.js';
import { churchModel } from './church-model.js';
import { WanderSimulation } from './wander.js';
import { DevilPeeker, drawDevil } from './devil.js';

export function startWandering(document,window) {
  const layer=document.getElementById('objects');
  if (!layer) return null;
  const simulation=new WanderSimulation(scene);
  const peeker=new DevilPeeker(scene);
  const devilNode=document.getElementById('forest-devil');
  const devilWrapper=document.createElementNS('http://www.w3.org/2000/svg','g');
  devilWrapper.appendChild(devilNode);
  const church=scene.objects.find(o=>o.kind==='church');
  const churchNode=document.getElementById(church.id);
  const churchDepth=project(church.position).y+(church.depthOffset??0);
  const entries=scene.objects.filter(o=>o.kind!=='devil').map(o=>{
    const node=document.getElementById(o.id);
    return {id:o.id,node:node.parentNode===layer?node:node.parentNode,depth:project(o.position).y+(o.depthOffset??0)};
  });
  // The front porch and steps can occlude a character who is already in front
  // of the nave. Keep these as separate layers with the same church transform.
  for (const [part,offset] of [['porch',.01],['steps',.02]]) {
    const wrapper=document.createElementNS('http://www.w3.org/2000/svg','g');
    wrapper.setAttribute('id',`${church.id}-${part}`);
    wrapper.setAttribute('transform',churchNode.getAttribute('transform'));
    wrapper.appendChild(churchNode.querySelector(`[data-part="${part}"]`));
    layer.appendChild(wrapper);
    entries.push({id:`${church.id}-${part}`,node:wrapper,depth:churchDepth+offset});
  }
  const actors=new Map(simulation.agents.map(a=>[a.id,a]));
  const actorNodes=new Map(simulation.agents.map(a=>[a.id,document.getElementById(a.id)]));

  function draw() {
    drawDevil(document,peeker,devilWrapper,devilNode);
    for (const agent of simulation.agents) {
      const node=actorNodes.get(agent.id),p=project(agent.position);
      node.setAttribute('transform',`translate(${p.x} ${p.y}) scale(${agent.scale})`);
      node.setAttribute('data-u',agent.position.u);
      node.setAttribute('data-v',agent.position.v);
    }
    for (const entry of entries) {
      const a=actors.get(entry.id);
      if (!a) continue;
      const u=a.position.u-church.position.u,v=a.position.v-church.position.v;
      const {center,main,porch,stair}=churchModel;
      const y=project(a.position).y;
      if (u<=main.width && v<=0) entry.depth=Math.min(y,churchDepth-.01);
      else if (u<=center+porch.halfWidth && v<=porch.front) entry.depth=churchDepth+.005;
      else if (u<=center+stair.width/2 && v<=porch.front+stair.count*stair.run) entry.depth=churchDepth+.015;
      else entry.depth=Math.max(y,churchDepth+.03);
    }
    // Only move nodes when their relative order changes; retain all SVG objects.
    const ordered=[...entries].sort((a,b)=>a.depth-b.depth);
    let cursor=layer.firstElementChild;
    for (const entry of ordered) {
      if (entry.node===cursor) cursor=cursor.nextElementSibling;
      else layer.insertBefore(entry.node,cursor);
    }
  }

  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=null,last=null;
  function animate(time) {
    if (last!==null) {
      const elapsed=(time-last)/1000;
      simulation.update(elapsed); peeker.update(elapsed);
    }
    last=time; draw(); frame=window.requestAnimationFrame(animate);
  }
  function sync() {
    if (frame!==null) window.cancelAnimationFrame(frame);
    frame=null; last=null;
    if (media.matches) devilNode.setAttribute('visibility','hidden');
    if (!document.hidden && !media.matches) frame=window.requestAnimationFrame(animate);
  }
  document.addEventListener('visibilitychange',sync);
  media.addEventListener('change',sync);
  draw(); sync();
  return {simulation,peeker,stop(){
    if (frame!==null) window.cancelAnimationFrame(frame);
    devilNode.setAttribute('visibility','hidden');
    document.removeEventListener('visibilitychange',sync);
    media.removeEventListener('change',sync);
  }};
}

if (typeof document!=='undefined') startWandering(document,window);
