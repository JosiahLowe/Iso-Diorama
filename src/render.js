import { scene } from './scene.js';
import { project, ellipse } from './geometry.js';
import { Church, Tree, Shrub, FlowerPatch, Grass, Rock, Stone, Character, Devil, Fence } from './components.js';

const components = {church:Church,tree:Tree,shrub:Shrub,flowers:FlowerPatch,grass:Grass,rock:Rock,stone:Stone,character:Character,devil:Devil,fence:Fence};

export function renderScene(world = scene) {
  const g = world.ground;
  const ground = `<g id="ground" data-kind="ground">${ellipse(560,365,298,178,'url(#grass-wash)','opacity=".4"')}${ellipse(g.cx,g.cy,g.rx,g.ry,'url(#grass-wash)')}${ellipse(550,529,267,151,'#b8c878','opacity=".15"')}${ellipse(416,493,133,96,'#c8d18d','opacity=".2"')}${ellipse(700,563,138,86,'#c3cb87','opacity=".2"')}</g>`;
  const details = [...world.path, ...world.groundDetails].map(o => components[o.kind](o)).join('');
  const objects = [...world.objects].sort((a,b) => (project(a.position).y + (a.depthOffset ?? 0)) - (project(b.position).y + (b.depthOffset ?? 0)));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${world.viewBox.join(' ')}" role="img" aria-labelledby="scene-title scene-description" preserveAspectRatio="xMidYMid meet">
    <title id="scene-title">A quiet church garden</title>
    <desc id="scene-description">A small cream church backed by a solid olive and sage forest. Five hooded, faceless figures wander the foreground around flowers and a stone path. A red horned devil occasionally peeks from behind a forest tree. The ground softly disappears into white.</desc>
    <defs>
      <clipPath id="devil-peek-right" clipPathUnits="userSpaceOnUse"><rect x="12" y="-110" width="60" height="116"/></clipPath>
      <clipPath id="devil-peek-left" clipPathUnits="userSpaceOnUse"><rect x="-72" y="-110" width="60" height="116"/></clipPath>
      <radialGradient id="grass-wash"><stop offset="0" stop-color="#c2cc88"/><stop offset=".53" stop-color="#c2cc88" stop-opacity=".94"/><stop offset=".78" stop-color="#c8d398" stop-opacity=".5"/><stop offset="1" stop-color="#dce3be" stop-opacity="0"/></radialGradient>
      <radialGradient id="world-fade"><stop offset="0" stop-color="white"/><stop offset=".69" stop-color="white"/><stop offset=".83" stop-color="white" stop-opacity=".9"/><stop offset=".94" stop-color="white" stop-opacity=".4"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient>
      <mask id="page-mist" maskUnits="userSpaceOnUse" x="50" y="0" width="1000" height="850"><ellipse cx="550" cy="418" rx="490" ry="420" fill="url(#world-fade)"/></mask>
    </defs>
    <g id="world"><g mask="url(#page-mist)">${ground}</g><g id="ground-details">${details}</g><g id="objects">${objects.map(o => components[o.kind](o)).join('')}</g></g>
  </svg>`;
}
