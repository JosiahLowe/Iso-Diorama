import { createCollisionWorld, Navigator, canTravel, distance } from './navigation.js';

export class WanderSimulation {
  constructor(scene,random=Math.random) {
    this.random=random;
    this.world=createCollisionWorld(scene);
    this.agents=scene.objects.filter(o=>o.kind==='character').map((o,i)=>({
      // A shared clearance encloses even the largest piece and keeps planning
      // and movement consistent when figures pass or wait beside each other.
      id:o.id,position:{...o.position},scale:o.scale??1,radius:22,
      speed:23+i*1.2,pause:.8+i*.45,route:[],blocked:0
    }));
    this.navigator=new Navigator(this.world,Math.max(...this.agents.map(a=>a.radius)));
  }

  others(agent) {
    return this.agents.filter(a=>a!==agent).map(a=>({...a.position,radius:a.radius}));
  }

  chooseRoute(agent) {
    const others=this.others(agent),nodes=this.navigator.nodes;
    for (let attempt=0;attempt<18;attempt++) {
      const goal=nodes[Math.floor(this.random()*nodes.length)];
      if (!goal) break;
      const d=distance(agent.position,goal);
      if (d<55 || d>230) continue;
      const path=this.navigator.findPath(agent.position,goal,others);
      if (path.length) { agent.route=path; return; }
    }
    agent.pause=.6+this.random();
  }

  update(elapsed) {
    if (!Number.isFinite(elapsed)||elapsed<=0) return;
    // Long stalls pause the world instead of fast-forwarding through it.
    let remaining=Math.min(elapsed,.25);
    while (remaining>1e-8) {
      const dt=Math.min(remaining,1/30); remaining-=dt;
      for (const agent of this.agents) {
        if (agent.pause>0) { agent.pause-=dt; continue; }
        if (!agent.route.length) { this.chooseRoute(agent); continue; }
        const target=agent.route[0],length=distance(agent.position,target);
        if (length<.01) { agent.route.shift(); continue; }
        const step=Math.min(agent.speed*dt,length),t=step/length;
        const next={u:agent.position.u+(target.u-agent.position.u)*t,v:agent.position.v+(target.v-agent.position.v)*t};
        if (canTravel(agent.position,next,agent.radius,this.world,this.others(agent))) {
          agent.position=next; agent.blocked=0;
          if (step>=length-1e-8) {
            agent.route.shift();
            if (!agent.route.length) agent.pause=1+this.random()*2.8;
          }
        } else {
          agent.blocked+=dt;
          // Waiting briefly lets another piece pass; otherwise choose a fresh
          // route with that piece's current footprint treated as an obstacle.
          if (agent.blocked>.65) {
            agent.route=[]; agent.blocked=0; agent.pause=.2+this.random()*.7;
          }
        }
      }
    }
  }
}
