# Realism pass 2 for THURSDAY (read fully before touching code)

Read `CLAUDE.md` (build, tests, budget, layout, rules) and `docs/DESIGN.md` first. THURSDAY is live at
https://mrbbqgc-pixel.github.io/thursday/ (Update 1.004). Four parts run in parallel in separate git worktrees and are merged afterwards:

| Part | Branch / worktree | Owns |
|---|---|---|
| T time of day | `tod` → /home/claude/thursday-tod | lighting, sky, fog, sun/moon, light setup, emissive night glow of streetlights, signs and windows, car headlights/taillights (traffic in 07c and borrowable/driven cars in 06e: only the light parts), a time-of-day setting |
| S sound | `snd` → /home/claude/thursday-snd | `04-fx-audio.js` (gunshot echo/reverb, footsteps by surface, distance filtering), surface lookup |
| X textures | `tex` → /home/claude/thursday-tex | `01b/01c` atlas painting and ground/road texture painting, facade cells, `02a` facades, Foothill strip storefronts (`02e/02f` strip malls, gas station, fast-food pads) |
| A enemies | `ai` → /home/claude/thursday-ai | `07a-ai-core.js`, `07b-ai-behave.js` (cover, flanking, suppression, squad tactics), cover points from `03c` nav if needed |

## Rules for everyone

- Work only in your own worktree; edit ONLY the files your part owns. If you need a hook in a file you don't own, keep it to one or
  two lines commented with your part's tag, e.g. `// (tod)`, and list them in your report.
- All src modules are concatenated into ONE function scope: never declare a top-level name that already exists (grep first).
- The world must build identically on every machine (multiplayer peers build the same town): do not add or remove `rnd()` draws in
  the world build; use a side stream for any new random choices (see `isoR` in 01c). static3 counts may change only for the part
  that owns geometry (X), and X must say so. If anything a peer sends changes, say so (the coordinator raises `PV` once at merge).
- Build: `sh build.sh` (terser in tools/ is linked). Tests from `test/` (each must print `no console errors` and `no outside requests`):
  w1.json, t16.json --mobile, w2b.json --ios, t12.json, a1.json --artifact, v1.json, r1.json (bot plays all 8 stages: ≥2 of 3 wins;
  known pre-existing stalls: behind the Market Hall, guards behind a back wall near (−280,96)), mp-versus, mp-versus2, mp-coop,
  mp-edge, mp-drive (PASSED n/n), static3. Under heavy machine load Playwright clicks can time out; wait and rerun (or use a
  JS `.click()` eval step), don't chase phantom failures.
- Phone budget (CLAUDE.md): 120k–185k triangles and ≤155 draw calls in play; the menu flyover ≤265k; town build ~1.1–1.2 s headless
  (`test/perf.js` and static3 print times; don't let load time grow by more than ~10%). Shader programs: the first menu frame compiles
  13; avoid adding many new material variants (each is a shader compile on iPhone).
- LOOK at your before/after screenshots with the Read tool, at phone size (`--ios`) and desktop. Viewpoints: the start house in
  third person (spawn (−60.3,−366.6)), a tract street (200,1.7,−380 → 260,1.5,−380), Foothill (−300,1.7,8 → 300,2,8), the Route 66
  strip lot (−120,1.7,60 → −120,2,100), Market Hall patio (40,1.7,175 → 40,3,215), Promenade (1150,1.7,−40 → 1150,3,−160), the menu.
  `__game.cam(x,y,z,tx,ty,tz)` places the camera; pause first to keep it (see test/diag/st.json); `__game.setViewMode(true)` = third person.
- Content rules: no real brands or businesses (fictional names only), no film characters/lines, no stereotypes; schools are quiet;
  civilians aren't targets; the friend's block shows no house numbers, street-name signs or names.
- Commit on your branch at milestones (`WIP: ...`), messages ending with exactly:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01FMPSMKqrtEpApmHWdrUwgJ`.
  Use the repo's configured git identity (never `-c user.email`). Do not push. Usage limits can cut you off at any time: commit often.
  Before your final commit restore `index.html` and `manifest.webmanifest` to the branch version (the coordinator rebuilds after merging).
- Report concisely: final commit, what changed, hooks in other files, budget and load-time numbers before/after, test results,
  screenshot paths (copy to /tmp/claude-0/-home-claude/ef7b5428-e669-5f1e-89d5-fac03a189eed/scratchpad/r2/<part>/).
