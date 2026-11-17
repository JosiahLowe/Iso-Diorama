// The forest visitor is deliberately separate from the foreground walkers.
// Only one figure exists; it changes trees while completely hidden.
export class DevilPeeker {
  constructor(scene,random=Math.random) {
    this.random=random;
    this.trees=scene.objects.filter(o=>o.kind==='tree' && o.peekSide);
    this.phase='hidden'; this.elapsed=0; this.duration=3+random()*3;
    this.tree=null; this.previous=null;
  }

  transition() {
    this.elapsed=0;
    if (this.phase==='hidden' && this.trees.length) {
      const choices=this.trees.filter(t=>t.id!==this.previous);
      this.tree=(choices.length?choices:this.trees)[Math.floor(this.random()*(choices.length||this.trees.length))];
      this.previous=this.tree.id; this.phase='enter'; this.duration=.85;
    } else if (this.phase==='enter') {
      this.phase='hold'; this.duration=1.8+this.random()*2.2;
    } else if (this.phase==='hold') {
      this.phase='exit'; this.duration=.8;
    } else {
      this.phase='hidden'; this.duration=7+this.random()*10;
    }
  }

  update(elapsed) {
    if (!Number.isFinite(elapsed)||elapsed<=0) return;
    this.elapsed+=Math.min(elapsed,.25);
    if (this.elapsed>=this.duration) this.transition();
  }

  get pose() {
    const t=Math.min(1,this.elapsed/this.duration),ease=t*t*(3-2*t);
    const amount=this.phase==='enter'?ease:this.phase==='hold'?1:this.phase==='exit'?1-ease:0;
    return {tree:this.tree,visible:this.phase!=='hidden',side:this.tree?.peekSide??1,offset:-12+amount*33};
  }
}

export function drawDevil(document,peeker,wrapper,node,visible=true) {
  const pose=peeker.pose;
  if (!visible || !pose.visible || !pose.tree) {
    node.setAttribute('visibility','hidden'); return;
  }
  const tree=document.getElementById(pose.tree.id);
  if (wrapper.parentNode!==tree) tree.insertBefore(wrapper,tree.firstElementChild);
  wrapper.setAttribute('clip-path',`url(#devil-peek-${pose.side>0?'right':'left'})`);
  const scale=.64/(pose.tree.scale??1);
  node.setAttribute('transform',`translate(${pose.side*pose.offset} 0) scale(${scale})`);
  node.setAttribute('visibility','visible');
}
