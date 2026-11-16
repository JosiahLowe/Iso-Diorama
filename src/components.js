import { COS30, project, solid, group, ellipse, circle, path } from './geometry.js';

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

export function Character(object) {
  const { color, shade, hat } = object;
  const body = path('M-14-49 Q-24-37-29-8 Q-30-2-23 0 Q0 7 23 0 Q30-2 28-9 Q24-35 14-49Z', color);
  const fold = path('M9-45 Q13-22 18 2 L24 0 Q30-2 28-9 Q24-35 14-49Z', shade);
  let head = '';
  if (hat === 'hood') {
    head = ellipse(0,-60,22,24,color) + path('M-16-55 -23-35 -9-40 0-35 11-40 22-34 16-54Z',color) + ellipse(0,-59,12.5,14,'#f2d4a1');
  } else if (hat === 'bonnet') {
    head = circle(0,-62,22,color) + circle(-13,-52,8,color) + circle(14,-52,8,color) + ellipse(0,-59,12.5,14,'#f2d4a1');
  } else if (hat === 'cap') {
    head = ellipse(0,-58,12.5,14,'#f2d4a1') + path('M-23-65 Q-20-81-4-81 Q12-81 19-65 L27-61 Q30-57 22-56 L-27-60 Q-31-63-23-65Z', color);
  } else if (hat === 'knotted') {
    head = circle(0,-81,9,color) + circle(0,-61,22,color) + path('M-18-57 -22-40 -9-43 15-42 20-53Z',color) + ellipse(0,-57,12.5,14,'#f2d4a1');
  } else {
    head = ellipse(0,-60,22,23,color) + path('M-25-64 Q-4-88 16-73 L31-61 Q34-55 25-54 L13-57Z', shade) + ellipse(0,-55,12.5,14,'#f2d4a1');
  }
  return group(object, `<g data-part="body">${body}${fold}</g><g data-part="head">${head}</g>`);
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

// Architecture shares the ground coordinate system. Only the church's local
// coordinates are authored here; moving its scene position moves every part.
export function Church(object) {
  const walls =
    solid([[0,0,0],[170,0,0],[170,0,145],[85,0,226],[0,0,145]], '#eee4c9') +
    solid([[170,0,0],[170,-210,0],[170,-210,145],[170,0,145]], '#e2d7b9');
  const windows = plane(0,0,'front', arch(24,-47,16,53,'#a39878') + arch(148,-40,16,53,'#a39878')) +
    plane(170,0,'side',[48,107,168].map(x => arch(x,-40,17,53,'#958a6d') + arch(x-2,-43,11,47,'#a69b7c')).join(''));
  const roof = solid([[-10,12,147],[85,12,238],[85,-220,238],[-10,-220,147]], '#bc8058') +
    solid([[85,12,238],[180,12,147],[180,-220,147],[85,-220,238]], '#b97751') +
    solid([[180,12,147],[180,-220,147],[180,-220,140],[180,12,140]], '#986747') +
    solid([[-10,12,147],[85,12,238],[85,12,229],[-10,12,139]], '#9f6b48');
  // A few broad roof planes provide depth without a tiled texture.
  const seams = [0,46,92,138,184].map(d => solid([[86,-d,237],[179,-d,148],[179,-d-2,148],[86,-d-2,237]], '#b2734e')).join('');
  const tower = solid([[52,3,154],[112,3,154],[112,3,310],[52,3,310]], '#f0e5ca') +
    solid([[112,3,154],[112,-57,154],[112,-57,310],[112,3,310]], '#dfd2b2') +
    plane(52,3,'front',arch(30,-253,17,45,'#9c8c6c')) +
    solid([[45,10,311],[119,10,311],[82,-27,396]], '#bd7b55') +
    solid([[119,10,311],[119,-64,311],[82,-27,396]], '#ad704c') +
    solid([[45,10,311],[45,-64,311],[82,-27,396]], '#c78b64');
  const crossAt = project({u:82,v:-27,z:396});
  const cross = `<g transform="translate(${crossAt.x} ${crossAt.y})">${path('M-4 1 V-50 L1-53 7-50 V-32 L24-23 V-14 L7-22 V4Z','#94734c')}${path('M-4-33 -20-42 -25-39 V-31 L-4-20Z','#a17e51')}</g>`;
  const porch = solid([[45,18,0],[125,18,0],[125,18,101],[85,18,146],[45,18,101]], '#f0e5cc') +
    solid([[125,18,0],[125,-13,0],[125,-13,101],[125,18,101]], '#d9cdb0') +
    plane(45,18,'front',arch(40,0,52,100,'#ac9874') + arch(44,0,44,94,'#8a7555') + path('M40-87 Q27-73 27-58 V0 H18 V-65 Q19-81 40-87Z','#a08a66')) +
    solid([[38,25,103],[85,25,156],[85,-22,156],[38,-22,103]], '#b77a53') +
    solid([[85,25,156],[132,25,103],[132,-22,103],[85,-22,156]], '#ba7c54') +
    solid([[85,25,156],[132,25,103],[132,25,95],[85,25,148]], '#996845') +
    solid([[38,25,103],[85,25,156],[85,25,148],[38,25,95]], '#9c6b49');
  const steps = [2,1,0].map(i => {
    const v = 20+i*13, z=18-i*6;
    return solid([[44,v,z],[127,v,z],[127,v+13,z],[44,v+13,z]], '#d7cfb6') +
      solid([[44,v+13,z],[127,v+13,z],[127,v+13,z-6],[44,v+13,z-6]], '#bfb69c') +
      solid([[127,v,z],[127,v+13,z],[127,v+13,z-6],[127,v,z-6]], '#c7bda2');
  }).join('');
  const at = project(object.position);
  const base = project({u:0,v:0});
  return `<g id="${object.id}" data-kind="church" data-u="${object.position.u}" data-v="${object.position.v}" transform="translate(${at.x-base.x} ${at.y-base.y})"><g data-part="walls">${walls}${windows}</g><g data-part="roof">${roof}${seams}</g><g data-part="tower">${tower}${cross}</g><g data-part="porch">${porch}</g><g data-part="steps">${steps}</g></g>`;
}
