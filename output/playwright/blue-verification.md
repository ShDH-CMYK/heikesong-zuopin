# Blue.rar replacement verification — 2026-09-12

- Source asset: Blue.rar OBJ, 499,046 vertices and 998,232 triangles, with complete UVs and four 4K PBR maps.
- Blender source keeps the full mesh in hidden `SOURCE`; web copy is 179,680 triangles with 14 bones and actual weights.
- `deepseek.glb` loads in Chromium with local Three.js and Draco decoder; page state is `ready` and animations are `Idle,React`.
- Browser screenshots confirm front, side and back orbit views, click reaction, and the four PBR maps rendered in the model.
- JavaScript checks pass for `model3d.js` and `game.js`; `git diff --check` passes apart from Git's LF/CRLF notices.
- Weight validation passes: 140,906 decoded vertices, 179,680 triangles, 0 unweighted vertices, 0 invalid joint indices, 0 weight-sum failures; maximum sum error 1.08e-5.
- Limitation: the supplied fused topology is animated with gentle head, torso, arm and tail movements; it is not a retargetable humanoid rig and has no facial morph or cloth simulation.

Post-merge checks against remote base `0dc07adf3f7d43e4c9eac788406b045d238dd68e`:

- The current display name is 拆镜; the `deepseek` asset identifier is unchanged. The three-step home guide and final dossier UI are preserved.
- Fresh browser front, side and back screenshots show the Blue asset on the merged page; canvas state is `ready` and animations are `Idle,React`, with no console errors or warnings.
- At 390 × 844, page and body scroll widths equal the viewport width (390 px). The model loads and renders normally.
- Simulating HTTP 503 for the GLB sets state to `fallback` and keeps the loaded portrait visible (`naturalWidth=724`).
- Entering the lab now resets the viewport to the top, so selecting a scrolled mobile card immediately brings the model into view.
- The repository's existing `tools/regression.py` from the remote base was run against the merged local page: **41/41 passed**, including pet switching, 3D readiness, dialogue, dossier generation/copy state, input escaping, clearing, mobile layout, and resource/error checks.

Screenshots: `blue-final-front.png`, `blue-final-side.png`, `blue-final-back.png`, `blue-final-react.png`.
