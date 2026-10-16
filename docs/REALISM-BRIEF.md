# Realism pass for THURSDAY (read fully before touching code)

Read `CLAUDE.md` (build, tests, budget, layout, rules), `docs/DESIGN.md` (what the game is) and `docs/BUILD-BRIEF.md` (engine
essentials and the world frame) first. THURSDAY is live at https://mrbbqgc-pixel.github.io/thursday/; this pass makes it look and feel
more like a real place — Rancho Cucamonga around 2000 — within what a phone browser and code-drawn geometry can do.

## Setup in your worktree

- You work in your own git worktree of `/home/claude/thursday` (find it with `pwd`; your branch is checked out). Link the test
  dependencies once: `ln -sfn /home/claude/operacion-insurgentes/test/node_modules test/node_modules` from the worktree root.
- Build: `sh build.sh`. Tests from `test/`: see CLAUDE.md. Every run must print `no console errors` and `no outside requests`.
- Screenshots: copy `test/w1.json` into your own scenario; `__game.cam(x,y,z,tx,ty,tz)` places the camera. To keep the camera where
  you put it, pause first: `g.G.state='pause';document.getElementById('menu').hidden=true;document.getElementById('hud').hidden=true;`
  (see `test/diag/st.json`). In tests the game starts in first person; `__game.setViewMode(true)` switches to third person.
  LOOK at your before/after pictures with the Read tool; how it looks is the point. Useful viewpoints (x, y, z → target):
  tract street (−180, 1.7, −319 → −120, 1.5, −319); Aunt Ro's cul-de-sac (−222, 1.7, −309 → −227, 1.5, −325); Foothill
  (−300, 1.7, 8 → 300, 2, 8); Route 66 strip lot (−120, 1.7, 60 → −120, 2, 100); Market Hall patio (40, 1.7, 175 → 40, 3, 215);
  Central Park (420, 1.7, −590 → 420, 1.5, −520); Promenade (1150, 1.7, −40 → 1150, 3, −160); Outlets lot (560, 1.7, 1060 →
  640, 4, 1110); menu flyover (state 'menu').
- Phone budget: 120k–185k triangles and ≤155 draw calls in view, measured with `test/static3.js` (it prints `tris`, `calls`, `verts` and
  per-module build times). Static geometry is baked into chunks (no extra draw calls); every dynamic mesh is a draw call. Don't let the
  world build time grow by more than ~20%.
- Four parts run in parallel in separate worktrees and get merged afterwards: edit ONLY the files your part owns. If you need a hook in a
  file you don't own, keep it to one or two clearly commented lines and list them in your report. Never declare a top-level name that
  already exists in another module (all modules share one scope, and a second `function x` silently replaces the first): grep for a
  name before you add it.
- Commit on your branch at milestones (`WIP: ...`), messages ending with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01FMPSMKqrtEpApmHWdrUwgJ`.
  Do not push. Work may be cut off by a usage limit at any time, so commit often.

## Earlier work you can reuse

The hometown game (same engine) has an unfinished realism pass saved on local branches of `/home/claude/operacion-insurgentes`:
lighting `worktree-agent-a21e6b52d03a6caf0`, street life `worktree-agent-a098fcb7204a50314`, clutter
`worktree-agent-a4f6d038ced46340a`, soldiers `worktree-agent-a5d84e1c16f0e011e`. See them with e.g.
`git -C /home/claude/operacion-insurgentes diff main...worktree-agent-a098fcb7204a50314 -- src`. That code targets the hometown map
(Mexico, a different street grid and different soldier models), so take ideas and code, but adapt them to THURSDAY's modules, names
and look; don't copy blindly.

## What looks unreal now (from screenshots)

- Lighting is flat; lawns are a uniform neon green; there is a flat tan haze band under the mountains; no tone mapping; no contact
  shadows or ambient occlusion where walls meet the ground.
- The player's own figure (always on screen in third person) is blocky, with puffy sphere shoulders; soldiers and squad are simple.
- Streets are empty: no people, no moving cars, no birds, no neighbourhood sound.
- Tracts and lots are too clean and uniform: every lawn the same, no bins, no clutter, few cars in driveways, parking lots tidy.

## Content rules (also in DESIGN.md)

Original work only; no film characters, lines or lookalikes; no real people; no real brands (generic names on everything); humour from
personality, never stereotypes. Civilians are ordinary, varied suburban adults (no children as civilians, since civilians can be hurt).
Animals are not hittable. Schools are quiet scenery. Nobody's real address is used or marked.
