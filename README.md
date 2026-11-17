# Iso-Diorama

A small church garden emerging from a white page. Programmatically generated SVG;
no raster artwork, external runtime libraries, or interface controls. Five hooded
figures wander the foreground, avoiding buildings, plants, rocks, and each other.
A red devil occasionally peeks from behind different opaque forest trees.

## Run

Node.js 20 or later; no dependency installation required.

```sh
npm run build
npm run dev
```

Open http://localhost:3000. Serve `dist/` to view the animated scene;
`dist/scene.svg` is the standalone, static vector artwork.
Rebuild after editing; the development server serves current build output.

## Scene architecture

- `src/scene.js` holds stable IDs, isometric positions, palettes, and object data.
- `src/geometry.js` supplies one 30-degree projection and its inverse.
- `src/church-model.js` holds shared building dimensions: one centerline for the
  entrance and tower, a common door/stair threshold, matching roof slopes, and
  one continuous cross silhouette. `npm test` checks these architectural joins.
- `src/components.js` renders independent buildings, trees, shrubs, flowers,
  characters, fence, stones, rocks, and grasses. Church parts and character heads
  and bodies have their own groups.
- `src/render.js` orders solid objects by ground depth. An elliptical opacity mask
  applies to the ground wash alone; scene objects and stepping stones have no
  fade masks. All object surfaces use flat colors at full opacity.

The initial scene is rendered at build time. `src/client.js` animates existing SVG
groups without rebuilding the scene. `src/navigation.js` derives ground obstacles
from scene objects and church dimensions, then finds clear routes using A* and
smooths them with swept collision checks. `src/wander.js` runs the independent
simulation: small movement steps, pauses, and replanning when another figure
blocks the route. Every move checks the full segment and the character's radius.
Church body, porch, and stairs are separate drawing layers during animation.
`src/devil.js` controls randomized hidden waits and slow peeks. The same devil
SVG moves between trees only while hidden; it is drawn behind its host tree and
clipped at the trunk edge. Reduced-motion preferences stop both animations, and
hidden tabs pause the simulation. Tree depth uses solid color palettes; only the
ground wash retains the white-space fade. All trunks use solid brown; vegetation,
rocks, stones, flowers, and figures remain fully opaque.
The viewBox preserves the complete composition at every viewport size.
