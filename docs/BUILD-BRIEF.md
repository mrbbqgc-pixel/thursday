# Build brief for the THURSDAY beta (read fully before touching code)

THURSDAY is a new game made from a copy of the Operación Insurgentes engine (a browser FPS, one page, three.js r128, no framework,
played mostly on phones). Read `docs/DESIGN.md` (what the game is, cast, rules) and `CLAUDE.md` (how the engine is built, tested and
laid out; it still describes the hometown game, Ciudad Insurgentes, and will be rewritten later). The engine code in `src/` is still
the hometown game; your job is to turn part of it into THURSDAY.

## Engine essentials (from CLAUDE.md, in short)

- One page: `src/00-page.html` + the JS modules in `src/` concatenated in the order of `src/files.txt` then the list in `src/build.sh`
  into ONE function scope. A module can use anything defined in earlier modules. Dense code style; match it.
- Build: `sh build.sh` from the repo root (writes `src/operacion-insurgentes.html` and `index.html`; the file names stay for now).
- Tests: `ln -s /home/claude/operacion-insurgentes/test/node_modules test/node_modules` once (from the repo root). Then from `test/`:
  `node play.js w1.json | python3 fmt.py` (desktop smoke test, writes `w1-menu.png`, `w1-play.png`), `node play.js t16.json --mobile |
  python3 fmt.py` (phone), `sh ../src/build-test.sh && node static3.js "$(cat s3a.json)"` (static world: tris, draw calls, verts, build
  time per module, screenshots). Every run must print `no console errors` and `no outside requests`.
  `window.__game` exposes state for tests; `__game.cam(x,y,z,tx,ty,tz)` places the camera for screenshots. Write your own small
  scenario JSONs (copy `w1.json`; steps are click / wait / eval / shot) for the views you need, and LOOK at the PNGs with the Read tool.
- Phone budget: about 120k–185k triangles and 100–155 draw calls in view in play; whole world about 1M vertices in chunk meshes.
  Static geometry is baked into 128 m chunks by `bat()/quadC()/boxC()/put()/pushGeo()` (01-core) and `bake()` (03a), so it costs no
  extra draw calls; dynamic meshes each cost a draw call. Colliders are axis-aligned boxes (`solid()`); navigation is a 3 m grid
  (`03c-nav.js`: `CELL, NX0, NZ0, NW, NH, blocked, reach, freeSpot`), bins for colliders (`BX0, BZ0, BW, BH`).
- Two parts are being built at the same time in separate git worktrees and merged afterwards, so ONLY edit the files your part owns
  (listed in your task). If you truly need a change in a file you do not own, keep it to a tiny, clearly commented hook and say so in
  your report.
- Commit on your branch when done (one or a few commits). Messages end with:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FMPSMKqrtEpApmHWdrUwgJ
  Do not push anywhere.

## Content rules (also in DESIGN.md)

Original characters and fictional business names only; no film characters, lines or lookalikes; no real people; no stereotypes (the
humour is personality, the enemy is a corporate private army); schools are quiet scenery (no spawns, no fighting objectives, add them to
the quiet-zone test that replaces `inCemetery`); civilians are not targets; residential streets are generic and made up; nobody's
real address is used or marked.

## World frame (shared by both parts — do not change without saying so)

Origin (0,0) = Haven Ave × Foothill Blvd (lat 34.1063, lon −117.5759). x = east, z = south (north is −z), metres.
Real distances are compressed to 30%: x = (lon + 117.5759) × 27654, z = −(lat − 34.1063) × 33285. Buildings, houses, cars and
people stay at real size; only the spacing between real places shrinks (as in GTA).

Main streets (approximate; the world part refines them from Census data in `/home/claude/thursday/data/tiger-major.txt` when it
exists, lines `layer|NAME|MTFCC|lon,lat lon,lat ...`; straighten them to the axis where they are nearly straight):

| Street | Axis | Position |
|---|---|---|
| Archibald Ave | N–S | x ≈ −487 |
| Hermosa Ave | N–S | x ≈ −250 |
| Haven Ave | N–S | x = 0 |
| Milliken Ave | N–S | x ≈ 570 |
| Rochester Ave | N–S | x ≈ 780 |
| Day Creek Blvd | N–S | x ≈ 1160 |
| 15 freeway | N–S (slightly diagonal) | x ≈ 1430, east edge |
| Base Line Rd | E–W | z ≈ −506 |
| Church St | E–W | z ≈ −270 |
| Foothill Blvd (Route 66) | E–W | z = 0 |
| Arrow Route | E–W | z ≈ +243 |
| Metrolink tracks | E–W | z ≈ +476 |
| 4th St | E–W | z ≈ +1020 |

Landmarks (fictional names; centre positions):

| Key | Name in game | Real model | Centre (x, z) | Notes |
|---|---|---|---|---|
| tract | Terra Linda (tract) | generic 1990s Rancho tract | x −480…−10, z −500…−20 | start area; two-story stucco, tile roofs, garages, lawns, block walls, cul-de-sacs |
| aunt | Aunt Ro's house | — | (−230, −300) | a house on a cul-de-sac in the tract; mission start, spawn [−230, −285] |
| culdesac | the cul-de-sac | — | (−230, −320) | stage 2 hold zone |
| strip | Route 66 strip mall + gas station | Foothill strip | (−150, 30) | strip mall with parking lot south side of Foothill, gas station at (−60, 25) |
| market | The Market Hall | the food hall on Haven | (40, 205) | big barn-like hall, patio with tables and a small stage on its north side |
| civic | Civic Center | city hall plaza | (25, 100) | plaza, fountain, a low civic building; Bobo boss arena |
| towncenter | Sierra Town Center | big-box shopping center | (190, −45) | big-box stores and a huge parking lot north of Foothill |
| ballpark | the ballpark | minor-league stadium | (770, 130) | small stadium, stands and lights |
| station | Metrolink station | train station | (440, 480) | platforms, tracks E–W along z ≈ 476 |
| promenade | Rancho Promenade | outdoor main-street mall | (1150, −160) | a 200 m "main street" of two-story storefronts N–S, fountain plaza at (1150, −160), parking around |
| outlets | Inland Empire Outlets | giant outlet mall | (660, 1110) | huge single-story mall, about 330 × 160 m, ringed by parking; entrance courts; Kingsley command post inside the south-west court |
| industrial | warehouses | south Rancho industrial park | x 0…1400, z 520…980 | big tilt-up warehouses, truck yards — cheap geometry |
| parks | Church St Park, Coyote Park, Central Park | city parks | (−200, −150), (300, −190), (430, −530) | grass, trees, ball fields, playgrounds |
| schools | two schools (quiet) | — | (−110, −180), (180, −160) | low classroom buildings, fences; quiet zone |
| mountains | San Gabriel Mountains | — | north horizon | huge, close ridges across the whole north, replacing the Sierra layers (which were in the east) |

Playable bounds: x −540 … 1480, z −560 … 1200. Spawn of the mission: Aunt Ro's house.

## Mission stages (the story part implements them in `08-mission.js`; positions from the table)

1. Wake-up call — clear the patrol on Aunt Ro's street (zone at the cul-de-sac entrance, about (−230, −280), r 40).
2. Cul-de-sac standoff — hold the cul-de-sac (−230, −320) r 30 for ~45 s against waves from the tract streets.
3. Route 66 — clear the strip mall and gas station on Foothill (−120, 30), r 60.
4. The Market Hall — retake the food hall (40, 205), r 50.
5. Bobo — boss fight at the Civic Center (25, 100): knock Bobo down (big health bar; he does not die, he gives up), then he joins.
6. The Promenade — fight down the main street to the fountain (1150, −160), r 45.
7. The Outlets — clear the parking lot and take the command post at the outlets' south-west court (≈ (540, 1170)); final: "Mission
   complete".
Travel between stages is long on this map; each stage's `spawn` (checkpoint) is placed near its zone, and the HUD waypoint guides the
player. The bot test (`r1.json`) must be able to finish it.
