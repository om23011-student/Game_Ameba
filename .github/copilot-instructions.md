<!-- .github/copilot-instructions.md - Guidance for AI coding agents working on this repository -->

# Copilot / AI agent instructions — AGI135

Purpose: provide immediate, actionable context for code edits in this small WebGL educational project.

- Big picture
  - This is a lightweight ES module WebGL demo suite. The `src/boundary` folder holds runnable examples (01_Puntos, 02_triangulos, 03_reloj). Each example exports a model class and then auto-initializes when a `canvas` element is found.
  - Shaders and GPU-specific logic live in `src/js/control/` as small provider classes that return shader source strings.
  - There is no bundler or build step: files are plain ES modules and must be served over HTTP to work in browsers.

- Key files and their roles
  - `src/boundary/01_Puntos.js` — demo for drawing points; shows buffer reuse and `.drawArrays(gl.POINTS)` usage.
  - `src/boundary/02_triangulos.js` — builds on the same shader/layout to draw triangles when ≥3 points exist.
  - `src/boundary/03_reloj.js` — the clock demo; shows precomputation of static geometry and an animation loop using `requestAnimationFrame`.
  - `src/js/control/vertex_shader_provider.js` and `fragment_shader_provider.js` — provide shader source via getters. Keep attribute name `coordenadas` and vec3 convention.

- Project-specific conventions (must follow)
  - Use explicit relative ES module imports including `.js` extension. Example: `import VertexShaderProvider from "../js/control/vertex_shader_provider.js";`
  - Attribute layout: shaders expect a `vec3` attribute named `coordenadas`. All buffers and `vertexAttribPointer` calls use 3 floats per vertex. Do not rename this attribute unless updating all shaders and call-sites.
  - Shaders are returned from getter properties (e.g., `threePointShader`, `theFragmentShader`). Preserve this pattern when adding shaders.
  - Boundary files follow an auto-init pattern: they export a model class and then do `const canvas = document.getElementById('canvas'); if (canvas) { new Model(canvas); }` — keep that structure for runnable examples.
  - Geometry is often precomputed (static) and concatenated with dynamic vertices each frame (see `03_reloj.js`). Preserve buffer reuse (`createBuffer`) and avoid creating buffers per-frame.

- Developer workflows (how to run & debug)
  - Serve `src/` over HTTP. VS Code task `lanzarBrowserSync` (in workspace tasks) uses BrowserSync to serve `src/`:

    npx browser-sync start --server "${workspaceFolder}/src" --files "${workspaceFolder}/src/**/*" --no-open

  - If you change imports or add files, reload the browser served by BrowserSync. Opening the HTML files under `src/boundary/*.html` requires the HTTP server (file:// will fail for ES modules).
  - Debugging: open browser DevTools console for shader compile/link errors and GL warnings. Use `gl.getShaderInfoLog` / `gl.getProgramInfoLog` patterns already present in the codebase.

- Integration points & external expectations
  - No third-party packages are required by the code — only optional dev tooling like BrowserSync for serving files. Keep edits compatible with being loaded as plain ES modules.
  - WebGL context is requested as `canvas.getContext('webgl')`. Guard code checks for `!gl` and alerts; follow that pattern when adding features.

- Safe edit rules for AI agents
  - Preserve attribute name `coordenadas` and vec3 buffer layout unless performing a repository-wide coordinated rename (update shaders + all `getAttribLocation`/`vertexAttribPointer` uses + examples).
  - Avoid introducing bundler-only syntax (e.g., bare package specifiers) — always use relative paths with `.js` extensions.
  - When adding new demos, follow existing directory pattern: `src/boundary/<NN_name>.js` plus a matching `<NN_name>.html` that provides a `canvas#canvas` element and simple controls.

- Minimal examples to follow
  - Import pattern: `import FragmentShaderProvide from "../js/control/fragment_shader_provider.js";`
  - Buffer upload (existing pattern):

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

  - Drawing logic: compute vertexCount as `vertices.length / 3` and call `gl.drawArrays` with `gl.POINTS`, `gl.LINES`, or `gl.TRIANGLES` as examples.

If any part of the runtime (serving, HTML structure, or attribute names) is unclear, ask before applying wide refactors. Feedback welcome — I can iterate on this file.
