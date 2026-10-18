# しば大行進

Portrait phone game about holding the line. Rival dogs walk out of the 犬の屋敷 at the top on random paths; soldier shibas march up from the 柴の家 at the bottom and hold a line mid-field. Each match sends a fixed pack of `DOG_COUNT` dogs; once the last has left the mansion the boss, a 48×48 セントバーナード with a gold barrel, walks out down the middle path. Beat every dog, the boss included, to win. Dogs that reach the field floor bite the 柴の家; when its gold HP bar empties the match is lost. There is no clock and no attack on the mansion. A dog icon and number beside the mansion count the dogs left, and a wide pink bar across the top shows the boss's HP while it is out. Match pay is a base for the result plus `BONE_PER_KILL` per dog beaten.

Four cards, four soldiers, each with its own role. The cards sit in one row of four. Every tap of a card sends out exactly one shiba, so the field stays readable (about a dozen shibas in a typical match); the next shiba of that coat costs a little more. After sending a shiba a card also needs a short recharge (`RECHARGE`: 赤 2.5s, 黒 6s, 白 4s, 胡麻 7s), shown as a night shutter over its portrait that slides away; a tap while it recharges is denied with the card shake, so a hoard of ホネ can't be dumped all at once. A match opens with one 赤 on each path.

- 赤 (tan card): a steady bite. Special 「サツマイモ!!」 sends every 赤 into a double-pace, double-bite rush.
- 黒 (black card): one heavy bite at a time that drops a small dog. Special 「ジャーキー!!」 pierces the front three dogs on every path, the boss included.
- 白 (white card): barks from the second row into its own path and both neighbors. Special 「チーズ!!」 is a field-wide shockwave that shoves every dog back.
- 胡麻 (sesame card): the healer. Every second it mends the most-hurt shiba near it, in its own path or the two beside, and a pink heart floats up. Its gauge fills with healing done. Special 「ササミ!!」 brings every shiba back to full and mends the 柴の家. A small pink heart badge marks the 胡麻 card and every 胡麻 on the field, since the coat alone is hard to tell from 赤 at a glance.

Specials fire on their own when a coat's gauge (damage it has landed) fills. A small cut-in slides in: the smug portrait, the food shouted in pixel katakana, and ゴゴゴ. When the cut-in leaves, the special strikes: that is when its damage lands, with hitstop, shake, a strike sound, and a field effect that runs for `FX_TIME`. 赤: sweet potatoes drop onto every 赤 and pop, then gold embers rise off them while the rush lasts. 黒: a jerky spear shoots up every path with a gold trail and bursts on the dogs it pierces. 白: a big cheese wedge slams the middle of the field and square shockwave rings spread out. Props are drawn at an integer scale with a `#120b10` outline. The next special waits until the strike's effect ends. Shout foods only, never a product name.

The field has five marching paths. They steer the sim, but the field draws no lane stripes: it is an open daytime meadow under a thin band of sky, and units spread a little left and right inside their path.

Stack: Vite, TypeScript, Canvas 2D. No runtime dependencies. Art is original pixel art in the closed palette below. Sound is Web Audio synthesis. Do not copy another game's art. External assets are allowed only when they are CC0 and recolored into this palette. No paid assets.

## Commands

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

`npm test` runs vitest against the match simulation and the pixel rules. `npm run build` typechecks, then writes `dist/` with Vite `base` `/shiba-daikoushin/` for GitHub Pages.

## Rules

- One theme per PR.
- Squash merge.
- Never force-push.
- No secrets in code.
- No paid services or assets.
- No ads, no monetization, no SNS posting.
- Verify at 390×844 before merge.

## Pixel art

Later PRs follow this standard. Simulation coordinates stay on the 390×844 field so speeds, spawns, cards, and the three-minute clock do not move. The renderer snaps every drawn coordinate onto the internal grid.

### Resolution

Design grid 195×422. CSS-pixel scale is an integer of at least 2, chosen so the internal width stays near 180–215. Internal width and height then flex with `ceil` so the blit covers the viewport. An odd CSS size may overflow by less than one scale step and stay clipped; the scale does not drop to make it exact. `imageSmoothingEnabled` stays false. No letterboxing, no fractional scale, and no half pixels. 195×422 ×2 is the 390×844 phone. The sky and meadow cover every extra pixel, including under the notch. Round drawn positions to integers. The page uses `100dvh`, `visualViewport`, and `viewport-fit=cover`.

### Sprite sizes

- Hero shiba: 32×32, big head, head and body the same height.
- Rival dogs: 28×28 front view. Three breeds share the foot and tail rows and differ by head: チワワ (huge pointed ears, bug eyes, fast and frail), コーギー (tall ears, white blaze, the baseline, no tail), ブルドッグ (rose ears, jowls, underbite, slow and tough). ブルドッグ join only once the clash starts.
- The code still names every foe a cat (`sim.cats`, `CAT_PX`, the cat palette names); `kind` on a foe is its breed.
- 犬の屋敷: 72×64, dim until the boss comes out.
- Boss dog: 48×48 front view, two walk frames, white hit flash.
- 柴の家: 64×48, a plank dog house with a bone plaque and a dark arched door, centered on the field floor. Its HP bar is gold, drawn over the units.
- Marching soldier: 24×24, with a steel helmet between the ears and a coat-colored band. Up to four fur colors plus the outline.
- Damage numbers: a dedicated pixel font, 8×10 per glyph.

### Palette

Only these colors:

- Shiba fur: `#6b2e12` `#a8521e` `#e08a3c` `#f6c27a`
- White: `#8a7f86` `#c9c0c4` `#fffaf0`
- Rival dogs (the enemy purples, so a foe never reads as a shiba): `#2b1d3a` `#5a3f7a` `#9a7ccf` `#d8c8f0`
- Gold, for damage, bones, and our shots: `#7a4a00` `#e0a200` `#ffe066` `#fffbd1`
- Enemy shots and danger: `#8a0f3a` `#ff3d7f` `#ffb3cf`
- Night, for the card dock, shadows, and UI: `#0b0f1e` `#18213d` `#2c3a63` `#4a5d8f`
- Meadow: `#2f5a2a` `#4a8a3a` `#7cba52` `#b6dd7a`
- Sky: `#8fd0f0` `#d4f0fb`
- Line: `#120b10`

### Drawing

Characters get a 1px outline. The outer edge is `#120b10`. Inner lines use the darker shade of that color. Backgrounds have no outline and do not move: no scrolling grass, no twinkling, no drifting particles behind the action. No jaggies and no isolated single pixels. Light comes from the top-left, in two shade steps.

### Shiba read

The crowd sprite and the 32×32 card portrait are the same front-facing shiba. A later PR keeps this read. At 24×24, in this order:

- Two pointed upright triangular ears. The left ear is lit `#e08a3c`, the right ear is in shadow `#a8521e`.
- Orange and tan fur with cream and white cheeks, muzzle, and chest (`#fffaf0`, `#f6c27a`).
- A dark nose, `#6b2e12`.
- A curled tail over the hip with a cream center.

The portrait is that same view with a larger head, eye highlights, and a thicker curl. It has three faces: open, blink, and smug (heavy lids, one brow up, a lopsided smirk) for the cut-in. Cute, but a little hateful.

The face smiles: a happy squint and a pink tongue (`#ffb3cf`), the シバスマイル. Urajiro runs unbroken from the cheeks down the chest.

Four coats share one set of rows and differ only by color map:

- 赤 (red): the tan card and most of its crowd.
- 胡麻 (sesame): red with `#6b2e12` tips on the crown and back. The 胡麻 card. The 赤 crowd is all 赤, so a 胡麻 on the field is always a healer.
- 白 (cream): `#f6c27a` body with `#e08a3c` ear and curl shade. The white card.
- 黒 (black and tan): the black card. Night shades for fur (`#2c3a63` body, `#4a5d8f` lit, `#18213d` shade), tan まろ眉 brows, tan curl underside, white urajiro.

Gestures: idle wags the curl, the attack windup shuts the mouth and the hit frame barks.

### Animation

Idle is 2 frames, 0.5s each. Walk and run are 4 frames at 12fps. Attack is 1 windup, 1 hit, and 2 recovery frames. A hit flash fills the sprite with `#fffaf0` for 0.06s. Defeated units fly off spinning in 90-degree steps, never a smooth rotation.

### Effects

Particles are square dots of 1, 2, or 3px. No circles, gradients, or translucency. Glow cycles the four golds. An explosion is 4 frames: white, yellow, orange, then particles. Screen shake is integer pixels, at most 3. Hitstop is 0.05s when a match is won and when a special strikes. Front-line fighters trade discrete bites every `BITE_EVERY` (0.7s) instead of draining HP every frame: the biter lunges 3px toward its foe for 0.1s and a white-and-gold star flashes where the bite lands. Shake and hitstop are cleared when a new match starts. A hurt unit shows a 16×2 HP bar 4px above its sprite with a `#120b10` border: gold for shibas, pink for dogs. Full-health units show none, so a calm field stays clean. Damage numbers are gold with a `#120b10` border. They pop from 1.5× to 1×, and that pop stays on integer pixels (12×15, then 8×10) with no fractional scale of the glyph grid.

Finish like a late Super Famicom game.

### Match end

Beating the last dog plays the 犬の屋敷 (spired towers and a keep with a floppy-eared dog face, the gate for a mouth) bursting: hitstop, a 4-frame explosion on the castle (white, yellow, orange, then square particles), a shiba hop, and a gold `CLEAR!` banner. The banner pops from 1.5× to 1× on integer pixels, holds for 2.4s, then the level-up screen appears. A loss shows a `LOSE!` banner for the same beat. No explanatory sentence.

### Levels

After either banner the level-up screen fills the view: the result word, the ホネ the match paid (`+` and gold digits), the saved purse, one row per coat (portrait, `LV` and level, the ホネ price of the next level; rows you cannot afford dim), and a gold `START` button that begins the next match. A win pays `WIN_PAY`, a loss `LOSS_PAY`, plus `BONE_PER_KILL` per dog beaten. A level costs `LEVEL_COST_BASE` × the current level, caps at `MAX_LEVEL`, and adds `LEVEL_STEP` to that coat's HP, bite, bark, and heal. Levels and the purse are saved in `localStorage` under `shiba-daikoushin-save`; a blocked storage keeps them for the visit only.
