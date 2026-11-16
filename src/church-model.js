// Architectural dimensions are in the same u/v/z space as the garden.
// All entrance parts derive from one axis and one threshold elevation.
export const churchModel = {
  center: 85,
  main: { width: 170, depth: 210, roofRidge: 238, roofEdge: 147, overhang: 10, skin: 8 },
  porch: { halfWidth: 44, front: 30, back: 0, eave: 120, ridge: 170, overhang: 7, skin: 6 },
  door: { width: 50, height: 94, threshold: 18, surround: 5 },
  stair: { width: 88, count: 3, rise: 6, run: 14 },
  tower: { halfWidth: 27, front: 0, back: -54, eave: 310, apex: 380, overhang: 5 },
  cross: { height: 52, width: 42, stem: 7, beamBottom: 31, beamTop: 38 }
};

export function mainRoofHeight(u) {
  const { center, main } = churchModel;
  return main.roofRidge - Math.abs(u-center) * (main.roofRidge-main.roofEdge)/(center+main.overhang);
}

export function porchRoofHeight(u) {
  const { center, porch } = churchModel;
  return porch.ridge + porch.skin - Math.abs(u-center)*(porch.ridge-porch.eave)/porch.halfWidth;
}

export function stairTreads() {
  const { center, porch, door, stair } = churchModel;
  return Array.from({length:stair.count}, (_,i) => {
    const left = center-stair.width/2, right = center+stair.width/2;
    const back = porch.front+i*stair.run, front = back+stair.run;
    const height = door.threshold-i*stair.rise;
    return [[left,back,height],[right,back,height],[right,front,height],[left,front,height]];
  });
}

// One continuous cross silhouette, projected in a vertical façade plane.
export function crossOutline() {
  const { center, tower, cross:c } = churchModel;
  const s=c.stem/2, w=c.width/2, v=(tower.front+tower.back)/2;
  return [[-s,0],[s,0],[s,c.beamBottom],[w,c.beamBottom],[w,c.beamTop],
    [s,c.beamTop],[s,c.height],[-s,c.height],[-s,c.beamTop],
    [-w,c.beamTop],[-w,c.beamBottom],[-s,c.beamBottom]]
    .map(([u,z]) => [center+u,v,tower.apex+z]);
}
