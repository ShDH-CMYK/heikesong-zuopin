# DeepSeek runtime verification — 2026-09-12

Chromium via Playwright CLI; local static HTTP server at port 8765. Desktop 1280 × 720 and mobile viewport 390 × 844. Tests operated the actual exported Draco GLB with the locally vendored Three.js loader.

- Compressed GLB loaded to `data-state=ready`, with `data-animations=Idle,React`.
- Front, side and back screenshots confirm a volumetric character and complete back/tail silhouette.
- Arrow keys rotate 15 degrees per press; 6/12 right-arrow presses show side/back. Home and the visible reset button return to the front.
- Pointer drag changes horizontal and vertical view; mouse wheel changes scale. Event counting confirmed drag did not emit a poke, and a subsequent click on the torso emitted exactly one poke.
- The poke button produces visible arm and tail deformation in the middle of the React animation, then the idle pose resumes.
- Mobile viewport has no horizontal document overflow. CDP two-finger touch input changes zoom and emits no accidental poke.
- Switching to each of the four other pets hides the 3D host and displays that pet's portrait. DeepSeek question/preset responses and inner-OS messages still appear.
- Aborted GLB request, disabled WebGL, and aborted Three.js module each reach `fallback` and keep a visible front portrait. Screenshots are taken after the existing scene entrance transition.
- Reduced-motion emulation yields identical idle screenshots across a delay, still permits an explicit reaction, then returns to identical settled screenshots. OS-bubble transitions are separate from the character animation.
- JavaScript syntax checks pass for model3d.js and game.js. A fresh successful-load page recorded no page errors.

Evidence: compressed-front.png, compressed-side.png, compressed-back.png, react-mid.png, drag-zoom.png, mobile-front.png, mobile-pinch.png, dialogue.png, fallback-model.png, fallback-webgl.png, fallback-dependency.png, reduced-motion.png.

This is browser touch emulation, not testing on a physical phone. Frame rates on low-end mobile hardware are not measured. Model shape fidelity should be assessed from the renders and browser screenshots, not from the successful network request alone.
