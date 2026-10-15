# THURSDAY

*The day before the weekend. Nobody told the private army.*

A first-person shooter comedy set in an alternate Rancho Cucamonga around the year 2000. It runs in the browser on a phone or a
computer; nothing to install.

Ray just moved out from the city to stay with his Aunt Ro for a quiet fresh start. That Thursday morning Kingsley Prime, a developer that
wants to bulldoze half the town for a luxury "lifestyle district", sends its private security in to "secure the area". The HOA is
furious, Aunt Ro runs the fight from her walkie-talkie, and Ray just wants to make it to Friday.

## The squad

- **Ray** (you): from the city, unimpressed by everything.
- **Aunt Ro**: HOA president. Treats lawn violations and invasions with the same seriousness. On the radio.
- **Junebug**: Ray's cousin. Works a kiosk at the outlet mall. Always mid-hustle, talks too much.
- **Mr. Pennington**: retired neighbour. Obsessed with his lawn, and a very good shot.
- **Bobo**: the block's legendary giant, a retired pro wrestler in flip-flops. Kingsley's goons towed his car, so he is in a terrible
  mood, and at first he thinks you are one of them.

## The mission

Seven stages: clear the patrol off Aunt Ro's street, hold the cul-de-sac, push down to Route 66, retake the Market Hall, get past Bobo at
the Civic Center, fight down the Promenade, and take Kingsley Prime's command post at the outlets. Survival mode: hold the cul-de-sac
against wave after wave.

## Controls

- **Phone or tablet:** turn it sideways. Left thumb moves, right thumb aims, FIRE shoots. On Android the game goes full screen when you start. On iPhone or iPad, use Share, then Add to Home Screen, and open the game from its icon to play full screen.
- **Computer:** WASD to move, mouse to aim and fire. Shift sprint, C crouch, Space jump, R reload, Q swap, G grenade, V knife, F pick up or use, M map, Esc pause.

## Multiplayer

Up to 8 players, phones and computers together: **Versus** (free-for-all or two teams, in the tract, on Route 66, on the Promenade or in
the outlets' parking lot), **co-op survival**, and the **co-op mission**.

1. One player taps **Multiplayer**, then **Create a game**, and sends the invite link (or reads out the five-character room code).
2. The others open the link, enter a name and tap **Join**.
3. The player who created the game picks the mode and taps **Start**. That player has to keep the game open until the end.

The players' devices connect to each other directly, with the free public [PeerJS](https://peerjs.com/) service making the introduction, so
play with people you know. Some networks block direct connections; if joining fails, switching between Wi-Fi and mobile data often helps.

## About the map

Inspired by Southern California suburbs. All characters and businesses are fictional. The main streets follow the real Rancho Cucamonga
grid with the distances between places shrunk to about 30% (buildings, cars and people stay real size); the big landmarks carry made-up
names, and houses and shops are generated (place data: Google Maps). The residential streets are made up and nobody's address is used.

## Building

The game's source is in `src/`. `sh build.sh` rebuilds `index.html`. `CLAUDE.md` has the details and the tests.

## Credits

Built on the Operación Insurgentes engine with [three.js](https://threejs.org/) r128 and [PeerJS](https://peerjs.com/) 1.5.5 (both MIT
licence). Fonts: Saira Stencil One and Saira Condensed (SIL Open Font Licence 1.1). Licence texts are in `web/vendor/`.
