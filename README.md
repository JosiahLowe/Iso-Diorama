# Iso-Diorama

A small church garden emerging from a white page. Programmatically generated SVG;
no raster artwork, runtime libraries, gameplay, or interface controls.

## Run

Node.js 20 or later; no dependency installation required.

```sh
npm run build
npm run dev
```

Open http://localhost:3000. `dist/index.html` is also a self-contained document
that can be opened directly. `dist/scene.svg` is the standalone vector artwork.
Rebuild after editing; the development server serves current build output.

## Scene architecture

- `src/scene.js` holds stable IDs, isometric positions, palettes, and object data.
- `src/geometry.js` supplies one 30-degree projection and its inverse.
- `src/components.js` renders independent buildings, trees, shrubs, flowers,
  characters, fence, stones, rocks, and grasses. Church parts and character heads
  and bodies have their own groups.
- `src/render.js` orders objects by ground depth and applies an elliptical opacity
  mask. Radial gradients are used only for the ground wash and white-space fade;
  object surfaces use flat colors.

The initial scene is rendered at build time for a fast, script-free page. The
renderer is also browser-compatible ES modules: future interaction code can
import `scene`, update world positions, and call `renderScene(scene)`, or target
individual SVG groups by stable ID. No interaction handlers are installed yet.
The viewBox preserves the complete composition at every viewport size.
