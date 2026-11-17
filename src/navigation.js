import { project, unproject } from './geometry.js';
import { churchModel } from './church-model.js';

const EPS = 1e-7;
export const distance = (a,b) => Math.hypot(a.u-b.u,a.v-b.v);

function pointSegmentDistance(p,a,b) {
  const du=b.u-a.u, dv=b.v-a.v, length=du*du+dv*dv;
  const t=length ? Math.max(0,Math.min(1,((p.u-a.u)*du+(p.v-a.v)*dv)/length)) : 0;
  return Math.hypot(p.u-a.u-t*du,p.v-a.v-t*dv);
}

function hitsRectangle(a,b,r) {
  let near=0,far=1;
  for (const [axis,lo,hi] of [['u',r.minU,r.maxU],['v',r.minV,r.maxV]]) {
    const d=b[axis]-a[axis];
    if (Math.abs(d)<EPS) { if (a[axis]<lo || a[axis]>hi) return false; }
    else {
      let t1=(lo-a[axis])/d, t2=(hi-a[axis])/d;
      if (t1>t2) [t1,t2]=[t2,t1];
      near=Math.max(near,t1); far=Math.min(far,t2);
      if (near>far) return false;
    }
  }
  return true;
}

function segmentDistance(a,b,c,d) {
  const cross=(p,q,r)=>(q.u-p.u)*(r.v-p.v)-(q.v-p.v)*(r.u-p.u);
  const s1=cross(a,b,c),s2=cross(a,b,d),s3=cross(c,d,a),s4=cross(c,d,b);
  if (((s1>EPS && s2<-EPS)||(s1<-EPS && s2>EPS)) &&
      ((s3>EPS && s4<-EPS)||(s3<-EPS && s4>EPS))) return 0;
  return Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));
}

export function obstacleBlocks(a,b,radius,o) {
  if (o.shape==='rect') return hitsRectangle(a,b,{
    minU:o.minU-radius,maxU:o.maxU+radius,minV:o.minV-radius,maxV:o.maxV+radius
  });
  if (o.shape==='capsule') return segmentDistance(a,b,o.a,o.b)<=o.radius+radius+EPS;
  return pointSegmentDistance(o,a,b)<=o.radius+radius+EPS;
}

export function createCollisionWorld(scene) {
  const obstacles=[];
  for (const object of scene.objects) {
    const {position:p,kind,id}=object, scale=object.scale??1;
    if (kind==='church') {
      const {center,main,porch,stair}=churchModel;
      for (const [part,left,right,back,front] of [
        ['body',0,main.width,-main.depth,0],
        ['porch',center-porch.halfWidth,center+porch.halfWidth,porch.back,porch.front],
        ['stairs',center-stair.width/2,center+stair.width/2,porch.front,porch.front+stair.count*stair.run]
      ]) obstacles.push({id:`${id}-${part}`,kind,shape:'rect',minU:p.u+left,maxU:p.u+right,minV:p.v+back,maxV:p.v+front});
    } else if (kind==='fence') {
      obstacles.push({id,kind,shape:'capsule',a:{u:p.u-40*scale,v:p.v},b:{u:p.u+37*scale,v:p.v},radius:8*scale});
    } else if (['tree','shrub','rock','flowers'].includes(kind)) {
      const sizes={tree:16,shrub:34,rock:29,flowers:18};
      obstacles.push({id,kind,shape:'circle',...p,radius:sizes[kind]*scale});
    }
  }
  return {obstacles,bounds:{cx:550,cy:535,rx:325,ry:210}};
}

export function insideGarden(p,radius,world) {
  const {x,y}=project(p),b=world.bounds;
  const rx=b.rx-Math.sqrt(1.5)*radius,ry=b.ry-Math.SQRT1_2*radius;
  return y-Math.SQRT1_2*radius>(b.minY??-Infinity) && ((x-b.cx)/rx)**2+((y-b.cy)/ry)**2<1;
}

export function canTravel(a,b,radius,world,others=[]) {
  // The garden is convex; checking both ends and sweeping the complete segment
  // against expanded obstacles prevents corner cutting and large-frame tunneling.
  return insideGarden(a,radius,world) && insideGarden(b,radius,world) &&
    !world.obstacles.some(o=>obstacleBlocks(a,b,radius,o)) &&
    !others.some(o=>obstacleBlocks(a,b,radius+2,{...o,shape:'circle'}));
}

class MinHeap {
  items=[];
  push(item) {
    this.items.push(item);
    let i=this.items.length-1;
    while (i>0) {
      const p=(i-1)>>1;
      if (this.items[p].score<=item.score) break;
      this.items[i]=this.items[p]; i=p;
    }
    this.items[i]=item;
  }
  pop() {
    const first=this.items[0],last=this.items.pop();
    if (this.items.length) {
      let i=0;
      while (2*i+1<this.items.length) {
        let c=2*i+1;
        if (c+1<this.items.length && this.items[c+1].score<this.items[c].score) c++;
        if (this.items[c].score>=last.score) break;
        this.items[i]=this.items[c]; i=c;
      }
      this.items[i]=last;
    }
    return first;
  }
}

export class Navigator {
  constructor(world,radius=23,cell=12) {
    this.world=world; this.radius=radius; this.nodes=[];
    const b=world.bounds;
    const corners=[unproject(b.cx-b.rx,b.cy-b.ry),unproject(b.cx+b.rx,b.cy-b.ry),unproject(b.cx-b.rx,b.cy+b.ry),unproject(b.cx+b.rx,b.cy+b.ry)];
    const minU=Math.floor(Math.min(...corners.map(p=>p.u))/cell),maxU=Math.ceil(Math.max(...corners.map(p=>p.u))/cell);
    const minV=Math.floor(Math.min(...corners.map(p=>p.v))/cell),maxV=Math.ceil(Math.max(...corners.map(p=>p.v))/cell);
    const byCell=new Map();
    for (let u=minU;u<=maxU;u++) for (let v=minV;v<=maxV;v++) {
      const p={u:u*cell,v:v*cell};
      if (!canTravel(p,p,radius,world)) continue;
      const node={...p,id:this.nodes.length,gridU:u,gridV:v,neighbors:[]};
      this.nodes.push(node); byCell.set(`${u},${v}`,node);
    }
    for (const node of this.nodes) for (let du=-1;du<=1;du++) for (let dv=-1;dv<=1;dv++) {
      if (!du&&!dv) continue;
      const next=byCell.get(`${node.gridU+du},${node.gridV+dv}`);
      if (next && canTravel(node,next,radius,world)) node.neighbors.push(next.id);
    }
  }

  findPath(start,goal,others=[]) {
    const {radius,world,nodes}=this;
    if (!canTravel(goal,goal,radius,world,others)) return [];
    if (canTravel(start,goal,radius,world,others)) return [{u:goal.u,v:goal.v}];
    const from=[...nodes].sort((a,b)=>distance(a,start)-distance(b,start))
      .find(n=>distance(n,start)<40 && canTravel(start,n,radius,world,others));
    const to=[...nodes].sort((a,b)=>distance(a,goal)-distance(b,goal))
      .find(n=>distance(n,goal)<40 && canTravel(n,goal,radius,world,others));
    if (!from||!to) return [];
    const cost=new Float64Array(nodes.length).fill(Infinity),parent=new Int32Array(nodes.length).fill(-1);
    const open=new MinHeap();
    cost[from.id]=0; open.push({id:from.id,score:distance(from,to),cost:0});
    let found=false;
    while (open.items.length) {
      const current=open.pop();
      if (current.cost>cost[current.id]) continue;
      if (current.id===to.id) { found=true; break; }
      const node=nodes[current.id];
      for (const id of node.neighbors) {
        const next=nodes[id],g=cost[node.id]+distance(node,next);
        if (g>=cost[id] || !canTravel(node,next,radius,world,others)) continue;
        cost[id]=g; parent[id]=node.id;
        open.push({id,score:g+distance(next,to),cost:g});
      }
    }
    if (!found) return [];
    const chain=[goal];
    for (let id=to.id;id!==-1;id=parent[id]) chain.push(nodes[id]);
    chain.reverse();
    const route=[];
    let current=start,i=0;
    while (i<chain.length) {
      let far=chain.length-1;
      while (far>i && !canTravel(current,chain[far],radius,world,others)) far--;
      if (!canTravel(current,chain[far],radius,world,others)) return [];
      current={u:chain[far].u,v:chain[far].v}; route.push(current); i=far+1;
    }
    return route;
  }
}
