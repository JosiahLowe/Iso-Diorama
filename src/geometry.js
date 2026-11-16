// One shared 30° projection. u and v run along the ground; z is height.
export const origin = { x: 470, y: 465 };
export const COS30 = Math.sqrt(3) / 2;
export function project({ u, v, z = 0 }) {
  return { x: origin.x + (u - v) * COS30, y: origin.y + (u + v) / 2 - z };
}
export function unproject(x, y) {
  const a = (x - origin.x) / COS30;
  const b = (y - origin.y) * 2;
  return { u: (a + b) / 2, v: (b - a) / 2 };
}
export function polygon(points, fill, attributes = '') {
  return `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="${fill}" ${attributes}/>`;
}
export function solid(points, fill) {
  return polygon(points.map(([u, v, z]) => {
    const p = project({ u, v, z });
    return [p.x, p.y];
  }), fill);
}
export function group(object, content) {
  const { x, y } = project(object.position);
  return `<g id="${object.id}" data-kind="${object.kind}" data-u="${object.position.u}" data-v="${object.position.v}" transform="translate(${x} ${y}) scale(${object.scale ?? 1})" opacity="${object.opacity ?? 1}">${content}</g>`;
}
export const ellipse = (x, y, rx, ry, fill, extra = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
export const circle = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
export const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
