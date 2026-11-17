import { COS30, project, solid, group, ellipse, circle, path } from './geometry.js';
import { churchModel, mainRoofHeight, porchRoofHeight, stairTreads, crossOutline } from './church-model.js';

export function Tree(object) {
  const { distant = false, palette = ['#a5b252', '#91a34c', '#7f9848'] } = object;
  const [light, mid, dark] = palette;
  return group(object,
    path('M-11 0 Q-7-35-10-66 L-37-91 -32-98 -8-79 -9-120 9-120 8-79 29-101 35-94 9-62 Q8-24 18 0 L5-3 -2 2Z', distant ? '#b4b28b' : '#9d8058') +
    `<g data-part="canopy">${ellipse(9, -134, 62, 56, dark)}${circle(-34, -129, 37, mid)}${circle(42, -147, 35, mid)}${circle(-22, -169, 40, light)}${circle(12, -191, 37, light)}${circle(34, -170, 29, light)}${circle(-49, -151, 26, light)}${ellipse(2, -138, 38, 30, mid)}</g>`);
}

export function Shrub(object) {
  const { flowers = [], color = '#92aa58' } = object;
  return group(object, ellipse(0, -7, 36, 16, '#829d50') + circle(-22, -18, 19, color) + circle(0, -28, 23, color) + circle(25, -18, 20, '#9db35f') + flowers.map(([x,y,c,s]) => Flower(x,y,c,s)).join(''));
}

// Repeated round petals keep flowers legible without texture or outlines.
export function Flower(x, y, color = '#e7a394', size = 1) {
  return `<g data-part="flower" transform="translate(${x} ${y}) scale(${size})">${[[0,-4.4],[4.2,-1.4],[2.6,3.6],[-2.6,3.6],[-4.2,-1.4]].map(([px,py]) => ellipse(px,py,3,3.5,color)).join('')}${circle(0,0,1.8,'#ecd58a')}</g>`;
}

export function FlowerPatch(object) {
  return group(object, object.blooms.map(([x, y, color, scale = 1]) =>
    `<g>${path(`M${x} 0 Q${x-2} ${y/2} ${x} ${y}`, 'none', 'stroke="#8da05d" stroke-width="2"')}${ellipse(x-4,y/2,5,2.3,'#92a65f',`transform="rotate(35 ${x-4} ${y/2})"`)}${Flower(x,y,color,scale)}</g>`).join(''));
}

export function Grass(object) {
  return group(object, path('M-17 0 Q-31-20-23-21 Q-14-21-8-4 Q-18-37-8-35 Q0-34 1-6 Q6-28 13-23 Q17-18 7-3 Q24-16 27-9 Q29-3 14 1Z', object.color ?? '#a0b36e'));
}

export function Rock(object) {
  return group(object,
    path('M-30-4 -22-22 -4-31 17-26 30-8 25 1 -8 6Z', '#b8b59a') +
    path('M-30-4 -22-22 -4-31 9-21 4-4 -8 6Z', '#c8c3a7') +
    path('M9-21 17-26 30-8 25 1 4-4Z', '#aaa98f'));
}

export function Stone(object) {
  return group(object, path('M-22-3 Q-21-10-9-12 L7-14 Q19-13 24-4 Q27 4 15 9 L-4 12 Q-19 10-24 4Z', object.color ?? '#d9cfaa'));
}

function Robe(color) {
  return path('M-16-48 Q-23-34-24-8 Q-25 0-20 2 Q0 6 20 2 Q25 0 24-8 Q23-34 16-48Z',color);
}

export function Character(object) {
  const color=object.color;
  return group(object,`<g data-part="body">${Robe(color)}</g><g data-part="head">${circle(0,-62,22,color)}${circle(0,-58,14.3,'#f3c991')}</g>`);
}

export function Devil(object) {
  const hood=circle(0,-62,22,'#aa2328');
  const horns=path('M-16-76 Q-25-85-17-96 Q-19-87-9-83 Q-10-77-16-76Z','#c72e32') +
    path('M16-76 Q25-85 17-96 Q19-87 9-83 Q10-77 16-76Z','#c72e32');
  const collar=path('M-10-44 Q-19-49-24-40 L-4-32 0-38 4-32 24-40 Q19-49 10-44Z','#c02b30') + circle(0,-36,4.5,'#cf3338');
  const hem=path('M-23-3 -16-7 -12 0 -6-5 0 2 6-5 12 0 16-7 23-3 Q24 3 0 4 Q-24 3-23-3Z','#861b21');
  return group(object,`${Robe('#a12126')}${hem}<g data-part="head">${hood}${horns}${circle(0,-58,14.3,'#f3c991')}</g>${collar}`,'visibility="hidden" aria-hidden="true"');
}

export function Fence(object) {
  return group(object,
    path('M-34-34 31-1 31 9 -34-24Z', '#aa8957') + path('M-34-20 31 13 31 21 -34-11Z', '#ac8956') +
    [-34, 27].map(x => path(`M${x-4} ${x/2-27} l5-3 7 4 v37 l-6 3 -6-4Z`, '#997a4b')).join(''));
}

function plane(u, v, side, content) {
  const { x, y } = project({ u, v });
  return `<g transform="matrix(${COS30} ${side === 'front' ? 0.5 : -0.5} 0 1 ${x} ${y})">${content}</g>`;
}

function arch(x, bottom, width, height, color) {
  const left = x - width/2, right = x + width/2, top = bottom-height;
  return path(`M${left} ${bottom} V${top+width*.65} Q${left} ${top+width*.15} ${x} ${top} Q${right} ${top+width*.15} ${right} ${top+width*.65} V${bottom}Z`,color);
}

// Every joint is authored in world coordinates before projection.
export function Church(object) {
  const { center:c, main:m, porch:p, door:d, tower:t } = churchModel;
  const wallEave = mainRoofHeight(0)-m.skin;
  const walls =
    solid([[0,0,0],[m.width,0,0],[m.width,0,wallEave],[c,0,m.roofRidge-m.skin],[0,0,wallEave]], '#eee4c9') +
    solid([[m.width,0,0],[m.width,-m.depth,0],[m.width,-m.depth,wallEave],[m.width,0,wallEave]], '#e2d7b9');
  const windows = plane(0,0,'front', arch(24,-47,16,53,'#a39878') + arch(146,-47,16,53,'#a39878')) +
    plane(m.width,0,'side',[48,107,168].map(x => arch(x,-40,17,53,'#958a6d') + arch(x,-43,11,47,'#a69b7c')).join(''));
  const roofFront=12, roofBack=-m.depth-m.overhang;
  const roof = solid([[-m.overhang,roofFront,m.roofEdge],[c,roofFront,m.roofRidge],[c,roofBack,m.roofRidge],[-m.overhang,roofBack,m.roofEdge]], '#bc8058') +
    solid([[c,roofFront,m.roofRidge],[m.width+m.overhang,roofFront,m.roofEdge],[m.width+m.overhang,roofBack,m.roofEdge],[c,roofBack,m.roofRidge]], '#b97751') +
    solid([[m.width+m.overhang,roofFront,m.roofEdge],[m.width+m.overhang,roofBack,m.roofEdge],[m.width+m.overhang,roofBack,m.roofEdge-m.skin],[m.width+m.overhang,roofFront,m.roofEdge-m.skin]], '#986747') +
    solid([[-m.overhang,roofFront,m.roofEdge],[c,roofFront,m.roofRidge],[c,roofFront,m.roofRidge-m.skin],[-m.overhang,roofFront,m.roofEdge-m.skin]], '#9f6b48') +
    solid([[c,roofFront,m.roofRidge],[m.width+m.overhang,roofFront,m.roofEdge],[m.width+m.overhang,roofFront,m.roofEdge-m.skin],[c,roofFront,m.roofRidge-m.skin]], '#a76f4b');
  const seams = [0,46,92,138,184].map(depth => solid([[c+1,-depth,mainRoofHeight(c+1)],[179,-depth,mainRoofHeight(179)],[179,-depth-2,mainRoofHeight(179)],[c+1,-depth-2,mainRoofHeight(c+1)]], '#b2734e')).join('');
  const tl=c-t.halfWidth, tr=c+t.halfWidth;
  const tower = solid([[tl,t.front,mainRoofHeight(tl)],[c,t.front,m.roofRidge],[tr,t.front,mainRoofHeight(tr)],[tr,t.front,t.eave],[tl,t.front,t.eave]], '#f0e5ca') +
    solid([[tr,t.front,mainRoofHeight(tr)],[tr,t.back,mainRoofHeight(tr)],[tr,t.back,t.eave],[tr,t.front,t.eave]], '#dfd2b2') +
    plane(c,t.front,'front',arch(0,-253,17,45,'#9c8c6c'));
  const apex=[c,(t.front+t.back)/2,t.apex];
  const spire = solid([[tl-t.overhang,t.front+t.overhang,t.eave],[tr+t.overhang,t.front+t.overhang,t.eave],apex], '#bd7b55') +
    solid([[tr+t.overhang,t.front+t.overhang,t.eave],[tr+t.overhang,t.back-t.overhang,t.eave],apex], '#ad704c');
  const cross = solid(crossOutline(), '#94734c');

  const pl=c-p.halfWidth, pr=c+p.halfWidth;
  const porchWalls = solid([[pl,p.front,0],[pr,p.front,0],[pr,p.front,p.eave],[c,p.front,p.ridge],[pl,p.front,p.eave]], '#f0e5cc') +
    solid([[pr,p.front,0],[pr,p.back,0],[pr,p.back,p.eave],[pr,p.front,p.eave]], '#d9cdb0');
  // Concentric arches share the building axis. The threshold is the rear edge
  // of the upper tread, rather than a separately positioned decoration.
  const doorway = plane(c,p.front,'front',
    arch(0,-d.threshold,d.width+2*d.surround,d.height+d.surround,'#bca988') +
    arch(0,-d.threshold,d.width,d.height,'#8a7555'));
  const rl=pl-p.overhang, rr=pr+p.overhang, rf=p.front+p.overhang, rb=p.back;
  const top=p.ridge+p.skin, edge=porchRoofHeight(rl);
  const porchRoof = solid([[rl,rf,edge],[c,rf,top],[c,rb,top],[rl,rb,edge]], '#b77a53') +
    solid([[c,rf,top],[rr,rf,edge],[rr,rb,edge],[c,rb,top]], '#ba7c54') +
    solid([[rl,rf,edge],[c,rf,top],[c,rf,top-p.skin],[rl,rf,edge-p.skin]], '#9c6b49') +
    solid([[c,rf,top],[rr,rf,edge],[rr,rf,edge-p.skin],[c,rf,top-p.skin]], '#996845') +
    solid([[rr,rf,edge],[rr,rb,edge],[rr,rb,edge-p.skin],[rr,rf,edge-p.skin]], '#a57550');
  const steps=stairTreads().map((tread,i) => {
    const [a,b,e,f]=tread;
    const nextHeight=tread[0][2]-churchModel.stair.rise;
    return `<g data-part="step" data-step="${i}">` +
      solid(tread,'#d7cfb6') +
      solid([b,e,[e[0],e[1],0],[b[0],b[1],0]],'#c7bda2') +
      solid([f,e,[e[0],e[1],nextHeight],[f[0],f[1],nextHeight]],'#bfb69c') + '</g>';
  }).join('');
  const at = project(object.position), base = project({u:0,v:0});
  return `<g id="${object.id}" data-kind="church" data-u="${object.position.u}" data-v="${object.position.v}" transform="translate(${at.x-base.x} ${at.y-base.y})"><g data-part="walls">${walls}${windows}</g><g data-part="roof">${roof}${seams}</g><g data-part="tower">${tower}<g data-part="spire">${spire}</g><g data-part="cross">${cross}</g></g><g data-part="porch">${porchWalls}<g data-part="doorway">${doorway}</g>${porchRoof}</g><g data-part="steps">${steps}</g></g>`;
}
