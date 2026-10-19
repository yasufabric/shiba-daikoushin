# しば大行進

Portrait phone game about holding the line. Rival dogs walk out of the 敵の犬小屋 at the top on random paths; soldier shibas march up from the 柴の家 at the bottom and hold a line mid-field. Each match sends a fixed pack of `DOG_COUNT` dogs; once the last has left the mansion the boss, a 32×32 セントバーナード with a gold barrel, walks out down the middle path. Beat every dog, the boss included, to win. Dogs that reach the field floor bite the 柴の家; when its gold HP bar empties the match is lost. There is no clock and no attack on the mansion. A dog icon and number beside the mansion count the dogs left, and a wide pink bar across the top shows the boss's HP while it is out. Match pay is a base for the result plus `BONE_PER_KILL` per dog beaten.

Four cards, four soldiers, each with its own role. The cards sit in one row of four. Every tap of a card sends out exactly one shiba, so the field stays readable (about a dozen shibas in a typical match); the next shiba of that coat costs a little more. After sending a shiba a card also needs a short recharge (`RECHARGE`: 赤 2.5s, 黒 6s, 白 4s, 胡麻 7s), shown as a night shutter over its portrait that slides away; a tap while it recharges is denied with the card shake, so a hoard of ホネ can't be dumped all at once. A match opens with one 赤 on each path.

- 赤 (tan card): a steady bite. Special 「サツマイモ!!」 sends every 赤 into a double-pace, double-bite rush.
- 黒 (black card): one heavy bite at a time that drops a small dog. Special 「ジャーキー!!」 pierces the front three dogs on every path, the boss included.
- 胡麻 (sesame card, third): throws a ball from the second row; it bursts in a splash on the dogs. Special 「チーズ!!」 is a field-wide shockwave that shoves every dog back.
- 白 (white card, fourth): the healer. Every second it mends the most-hurt shiba near it, in its own path or the two beside, and a pink heart floats up. Its gauge fills with healing done. Special 「ササミ!!」 brings every shiba back to full and mends the 柴の家. A small pink heart badge marks the 白 card and every 白 on the field.

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
- Rival dogs: 20×20 front view. Three breeds share the foot and tail rows and differ by head: チワワ (huge pointed ears, bug eyes, fast and frail), コーギー (tall ears, white blaze, the baseline, no tail), ブルドッグ (rose ears, jowls, underbite, slow and tough). ブルドッグ join only once the clash starts.
- The code still names every foe a cat (`sim.cats`, `CAT_PX`, the cat palette names); `kind` on a foe is its breed.
- 敵の犬小屋: 64×52, a purple kennel built by `kennel()` (banded gable roof with shingle dashes, plank wall, recessed arched door) with a red bone sign and glowing eyes and fangs in the door.
- Boss dog: 32×32 front view, two walk frames, white hit flash.
- 柴の家: 56×46, the same `kennel()` in warm colors with a gold bone sign and a water bowl by the step. Its HP bar is gold, drawn over the units.
- Marching soldier: 20×20 (白 is pure white; 胡麻 is speckled dark all over via `speckle()`), bare-headed, with pricked ears, tan brows, and a pale urajiro muzzle. Up to four fur colors plus the outline.
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

The crowd sprite and the 32×32 card portrait are the same front-facing shiba. A later PR keeps this read. At 20×20, in this order:

- Two pointed upright triangular ears. The left ear is lit `#e08a3c`, the right ear is in shadow `#a8521e`.
- Orange and tan fur with cream and white cheeks, muzzle, and chest (`#fffaf0`, `#f6c27a`).
- A dark nose, `#6b2e12`.
- A curled tail over the hip with a cream center.

The portrait is that same view with a larger head, eye highlights, and a thicker curl. It has three faces: open, blink, and smug (heavy lids, one brow up, a lopsided smirk) for the cut-in. Cute, but a little hateful.

The face smiles: a happy squint and a pink tongue (`#ffb3cf`), the シバスマイル. Urajiro runs unbroken from the cheeks down the chest.

Four coats share one set of rows and differ only by color map:

- 赤 (red): the tan card and most of its crowd.
- 胡麻 (sesame): a darker brown coat (`FUR_MID` body) with a few dark patches from `speckle()`. The third card, the ball thrower.
- 白 (cream): pure white fur with grey shade. The fourth card, the healer.
- 黒 (black and tan): the black card. Night shades for fur (`#2c3a63` body, `#4a5d8f` lit, `#18213d` shade), tan まろ眉 brows, tan curl underside, white urajiro.

Every unit animates: any step, up, down, or sideways, plays the walk; standing plays the idle; a unit that bit in the last second plays the attack. Gestures: idle wags the curl, the attack windup shuts the mouth and the hit frame barks.

### Animation

Idle is 2 frames, 0.5s each. Walk and run are 4 frames at 12fps. Attack is 1 windup, 1 hit, and 2 recovery frames. A hit flash fills the sprite with `#fffaf0` for 0.06s. Defeated units fly off spinning in 90-degree steps, never a smooth rotation.

### Effects

Particles are square dots of 1, 2, or 3px. No circles, gradients, or translucency. Glow cycles the four golds. An explosion is 4 frames: white, yellow, orange, then particles. Screen shake is integer pixels, at most 3. Hitstop is 0.05s when a match is won and when a special strikes. Front-line fighters trade discrete bites every `BITE_EVERY` (0.7s) instead of draining HP every frame: the biter lunges 3px toward its foe for 0.1s and a white-and-gold star flashes where the bite lands. Shake and hitstop are cleared when a new match starts. A hurt unit shows a 16×2 HP bar 4px above its sprite with a `#120b10` border: gold for shibas, pink for dogs. Full-health units show none, so a calm field stays clean. Damage numbers are gold with a `#120b10` border. They pop from 1.5× to 1×, and that pop stays on integer pixels (12×15, then 8×10) with no fractional scale of the glyph grid.

Finish like a late Super Famicom game.

### Match end

Beating the last dog plays the 敵の犬小屋 (a purple plank dog house with two pricked ears on its roof and glowing eyes in the dark door) bursting: hitstop, a 4-frame explosion on the castle (white, yellow, orange, then square particles), a shiba hop, and a gold `CLEAR!` banner. The banner pops from 1.5× to 1× on integer pixels, holds for 2.4s, then the level-up screen appears. A loss shows a `LOSE!` banner for the same beat. No explanatory sentence.

### Levels

After either banner the level-up screen fills the view: the result word, the ホネ the match paid (`+` and gold digits), the saved purse, one row per coat (portrait, `LV` and level, the ホネ price of the next level; rows you cannot afford dim), and a gold `START` button that begins the next match. A win pays `WIN_PAY`, a loss `LOSS_PAY`, plus `BONE_PER_KILL` per dog beaten. A level costs `LEVEL_COST_BASE` × the current level, caps at `MAX_LEVEL`, and adds `LEVEL_STEP` to that coat's HP, bite, bark, and heal. Levels and the purse are saved in `localStorage` under `shiba-daikoushin-save`; a blocked storage keeps them for the visit only.

## Free placement (the default)

Clash Royale–style placement is the game. `?lanes` in the URL brings back the five-path game described above, kept for comparison. In free placement everything walks `FREE_PACE` slower (bites keep their beat), cards recharge `FREE_RECHARGE` times slower, and summoning costs no ホネ: only the card recharge (time) gates it, and at most `FIELD_CAP` (8) shibas may be alive at once (a denied tap shakes the card; gold pips in the dock show the count). ホネ still pay for levels after a match. In the trial a tap anywhere on the field drops the picked shiba there, pulled down into the deploy zone below `FREE_ZONE_Y` (a dashed gold line marks its top; there are no path arrows). Every shiba walks to the nearest dog within `FREE_SIGHT_SHIBA` and bites it on the beat; with none in sight it walks up to `FREE_HOLD_Y` and waits. Shibas never go above `FREE_SHIBA_TOP`, so they can't camp the mansion gate. Every dog walks to the nearest shiba within `FREE_SIGHT_DOG`; with none in sight it walks straight down its column and turns for the 柴の家 door only in the last `FREE_TURN`, biting the house once within `FREE_HOME_REACH`. Units of one side push apart below `FREE_SPACE`. Because shibas gang up on dogs here, regular dogs get `FREE_DOG_HP` (2.6×) and `FREE_DOG_DPS` (2.2×) and waves come `FREE_WAVE_SLOW` (1.4) times slower, with bigger swarm, wall, and pincer waves; the boss is unchanged. The tutorial paw points into the deploy zone. Paths still exist under the hood (`lane` follows `x`), so barks, heals, and ジャーキー keep working. Everything else (cards, recharge, specials, healer, levels, the boss, win and loss) is shared with the lane game.

### Roles in free placement

Each coat has a job, with a strength and a weakness:

- 赤: cheap and quick (walks `TAN_HASTE` faster), bites on the beat, but has the least HP. Good for swarming and filling gaps.
- 黒: the tank. Most HP, slow and costly, one heavy bite every `HEAVY_EVERY`. Dogs in sight treat 黒 as `TAUNT` nearer than it is, so it pulls bites off the others.
- 胡麻: throws from `BARK_RANGE` instead of biting, hitting every dog within `BARK_SPLASH` of its target. Low HP; it needs biters in front. Its ball arcs to the target and bursts.
- 白: never attacks. It walks to the most-hurt shiba (lowest HP share, nearer wins ties, `HEAL_SEEK_SPAN`) until it is within `HEAL_CLOSE` of the ring radius, and trails the nearest shiba from just behind when nobody is hurt. Every `HEAL_EVERY` mends every shiba inside `HEAL_RADIUS` at once. A dotted pink ring always shows that radius, a white ring pulses when it heals, and a green plus floats over each shiba it mended.

### Specials in free placement

Every strike shows what it did to each unit it touched: gold digits float up over each dog it hurt, and a green plus with digits over each shiba it healed; the single total in the middle is hidden in free placement. Each special has its own job: 赤「サツマイモ!!」 is a buff, no numbers, just gold speed trails under every 赤 for the whole rush. 黒「ジャーキー!!」 is a few heavy single hits: a spear drops onto each of only `JERKY_TARGETS` (3) dogs nearest the 柴の家 for `JERKY_FREE_HIT`. 白「チーズ!!」 is crowd control: light damage (`CHEESE_FREE_HIT`), a big shove (`CHEESE_FREE_PUSH`), and every dog except the boss freezes for `CHEESE_STUN` seconds with gold stars over its head. 胡麻「ササミ!!」 is the only heal. Special damage scales with `FREE_DOG_HP` so it keeps up with the tougher dogs.


### Wave patterns in free placement

Once the clash starts, each wave is one of three named patterns (or the old mixed trickle, one time in four), picked a wave ahead and announced beside the mansion: the breed's head, the dog count, a three-slot strip lit where it comes from, and a gold bar that runs down to its arrival. No pattern repeats back to back, and nothing is announced during the opening trickle.

- チワワの群れ (`WAVE_SWARM`): `SWARM_COUNT` fast, frail チワワ from the left, right, or middle. Wants 胡麻 splash or a 黒 wall.
- ブルドッグの壁 (`WAVE_WALL`): `WALL_COUNT` slow, tough ブルドッグ shoulder to shoulder across the field. Wants focused 赤 and specials.
- コーギーの挟み撃ち (`WAVE_PINCER`): `PINCER_COUNT` コーギー split onto both edges. Wants shibas spread, not clumped.

### Short screens

When the screen is shorter than the 422-row design (a phone with the browser bars showing), the card dock rides up over the field. The field is then squeezed vertically (`fpy`) so its floor, the 柴の家, and the dogs at its door always stay above the dock; sprites keep their size, only the spots between them close up, and taps are mapped back the same way.

## Attack readouts and weaker specials (free placement)

Every bite shows where it lands, Clash Royale style: 赤 slashes three claw marks at the dog, 黒 slams a ground ring with a white cross flash, 胡麻 lobs a white ball in an arc that bursts into a `BARK_SPLASH`-sized ring (`paintAttacks` in render.ts; the sim stores `aimX/aimY` on every bite). Specials are weaker and charge slower (`SPECIAL_NEED` 1000/800/1400/900, `RUSH_TIME` 3, `CHEESE_STUN` 1.8, `JERKY_FREE_HIT` 130 on `JERKY_TARGETS` 2) so they are a swing, not a win button. Beats are slow enough to read: `BITE_EVERY` 1s, 赤 `TAN_BITE_EVERY` 0.55s, 黒 `HEAVY_EVERY` 2.3s, ball `BARK_EVERY` 2s; the claw marks last 0.55s, the slam ring 0.8s, the ball flies 0.4s then bursts for 0.5s.

## Role split

赤: fragile (HP 48), nipping every `TAN_BITE_EVERY` 0.55s. 黒: tank (HP 240, slow) that slams `HEAVY_HIT` 180 every 2.3s and draws the dogs. 胡麻: glass cannon (HP 40) that lobs a ball every 2s for `BARK_HIT` 42 in a `BARK_SPLASH` 56 radius from `BARK_RANGE` 140. 白: tough (HP 75), never attacks, mends 7 every 1.5s. More coats and tools (a frisbee, say) can be added later as new kinds.

## Recall (free placement)

Tapping one of your own shibas (within `RECALL_TAP` px of its middle) sends it home instead of placing a new one: it runs to the 柴の家 at `RECALL_PACE` times its walking speed, ignores dogs, and leaves the field at the door, freeing a `FIELD_CAP` slot so you can swap in another coat. A recalled shiba leaves quietly (no ghost or burst). Tap an empty spot to place as usual.

## More rival breeds

- ダックスフント (`BREED_DACHS`): long, low, floppy-eared sprinter (HP 14, speed 64). Every `DACHS_EVERY`th dog of a clash wave.
- ゴールデン (`BREED_GOLDEN`): slow retriever (HP 46, speed 22) holding a gold bone shield, which takes `GOLDEN_ARMOR` 8 off every single hit (never below a third of it). 赤's quick nips bounce off; 黒's slam and 胡麻's ball get through. Every `GOLDEN_EVERY`th dog.
- The boss moved to `BREED_BOSS` 5. `DOG_HALVES` in art.ts holds five breeds; the sprite sheet grows with `dogArt`.

## Stages and stars
`STAGES` in `balance.ts` has five stages: dog count, dog HP/DPS multipliers (the boss HP too) and how often the horde sends ダックス/ゴールデン/ブルドッグ (`*Every`, 0 = never). `?lanes` always uses the old plain numbers via `spec(sim)`. A win rates by 柴の家 HP left (`STAR3_AT` 0.7 → 3 stars, `STAR2_AT` 0.35 → 2, else 1) and keeps the best per stage in `sim.best`. START after a win opens the next stage (the last one replays); after a loss it replays the same stage. `stage` and `best` are saved with levels and the purse. The result screen shows `STAGE n` and the stars. Fast dogs stay fast on purpose: speed is part of the fun, so tune counts and HP before slowing a breed.

## Call the wave early
`callWave` (Input) sends the next wave now when `canCall` (free play, before the boss, more than 0.6s to wait). Each second skipped banks `CALL_BONE` ホネ in `sim.callBonus`, paid into `earned` at the end. The gold button sits under the 柴の家 on the left (`CALL_*` in `balance.ts`) and is drawn over the dogs.

## Renderer effects and the clock
Ghosts, booms and sparks are stamped with `sim.time`. START resets the clock to 0, so `draw` calls `forgetEffects` when time drops, and every age check ignores negative ages. A negative boom age once painted a screen-sized white rectangle on stage 2.

## 岩と池 (obstacles)
Each stage lists `rocks` in `balance.ts` (field coordinates, `pond` is drawn as water). They block ground units of both sides: `stepToward` ends with `walkAround`, which pushes a unit to radius `r + 7` and slides it along the edge to the side it is already on (dead centre goes right). Stage 1 has none; keep them out of the deploy zone (y > 440) and away from the top spawn rows. Drawn by `paintRocks` under the units, sealed with the 1px outline, in palette greys and sky blues.

## Roster, deck and the result screen
Six coats now (`KINDS` 6): 赤, 黒, 胡麻, 白 plus ぶち柴 (`KIND_DISC`, frisbee thrower, pierces a line, special ボーロ!! sweeps the front row) and どっしり柴 (`KIND_BIG`, slow, stomps everything at its paws, special ミルク!! pounds the thickest knot and stuns). Coats are palette maps over the same crowd/hero art (`BUCHI`, `GRAY` in `art.ts`). Free placement only: ?lanes keeps the first four.
A match brings `DECK_SIZE` (4) coats: `sim.deck`, saved with levels. Dock slot `s` shows coat `deck[s]`; cards send that coat number. On the result screen tap a coat's portrait to put it in or out of the deck (START stays dim until the deck is full) and the gold button to buy a level.
The result screen lays itself out from the top (`shopLayout`); short phones get a compact header and START floats at the bottom edge so it is never off screen. Taps on it map with `screenToWorld(..., flat)` and `shopTarget`, because the in-play dock squeeze must not apply there (it once made START miss on some phones).
`?dev` has `__shiba.place('s'|'c', kind, x, y)` to drop a shiba or dog for screenshots.

## Title screen and HUD polish
The game opens on a title screen (`sim.title`; `?dev` skips it): the logo, the deck's faces, the 柴の家 with rival dogs marching past, and one tile per stage showing its best stars. A stage opens once the one before it has a star (`stageOpen`); tapping a tile calls `selectStage`. The result screen has a small kennel button (top left) that goes back to the title. Taps on both screens map flat (`screenToWorld(..., flat)`), via `titleTarget` and `shopTarget`.
Cards and deck cells carry a 9×9 role icon (`drawRoleIcon`): claws, slam ring, ball, heart, frisbee, paw. The HUD shows `STAGE n` under the dog count.

## Sound
`audio.ts` is a WebAudio synth (`Synth`): per-coat hit sounds, deploy, special, call, pop, heal, tap, a win jingle scaled by stars, and a procedural 4-bar BGM (triangle melody + square bass, 128 bpm) scheduled from `unlock()` (first tap). `main.ts` `battleSounds()` turns sim events into sfx. A speaker tile (`paintMute`, top-right of the title/result screens and at the end of the dock's top row in play; tap via `muteTarget`) toggles mute; the choice persists under `shiba-daikoushin-mute`. The mute tap is checked before every other tap. Never add sound that cannot be muted.

## プードル (ranged dog)
`BREED_POODLE` (5; the boss moved to 6, `BREEDS` 6) stops at `POODLE_RANGE` (92) from the nearest shiba and lobs a ball every `POODLE_EVERY` s (hit = dps × every, instant; `paintLob` draws a 0.4 s arc from `bitAt`/`aimX`/`aimY`). Frail (22 hp), slow; stages mix it in via `StageSpec.poodleEvery` (stage 1 and ?lanes: none). Enemy sprites are the usual purple palette; art is `DOG_HALVES[5]`.

## ヒーロー柴
One steered shiba (`sim.hero`, a `Unit` kept outside the pools; enabled by `createSim({ hero: true })`, which only `main.ts` passes, so unit tests about the cards are unaffected). A field tap above `HERO_TAP_Y` (420, i.e. above the deploy strip) while it is alive sends it there (`Input.hero` → `sim.heroGo`); taps in the strip still deploy and taps on a shiba still recall it. `stepHero` walks to the tap, else toward a dog in sight, and spins every `HERO_EVERY` s for `HERO_HIT` to every dog within `HERO_RADIUS` (`sim.heroSpinAt` drives the ring). Dogs treat it like a shiba (nearest foe wins; it has no taunt). At 0 hp it vanishes and returns at the strip after `HERO_REVIVE` s with full health. Drawn by `paintHero` (red coat, 11×8 crown via `drawCrown`, gold ring, destination cross, own hp bar). While down it shows a grey crown and the seconds left. Until the player first steers it (`sim.heroUsed`, saved under `shiba-daikoushin-hero`) a bobbing TAP! hint floats over it.

## Eight stages
`STAGES` has 8 entries; 6-8 push hp/dps scaling (2.15/2.45/2.8) and lean on プードル and ダックス. The title lays stage tiles out `TITLE_ROW` (4) per row and wraps, shifting the block up 26 px per extra row.

## 2× speed
The dock's top row has a ▶▶ button left of the speaker (`speedTarget`, `paintSpeed`). It doubles the time fed to `step` during play only (title and result screens run at 1×), multiplies with the dev `setScale`, and is saved under `shiba-daikoushin-speed`. The sim never knows: it is purely how much time `advance` hands it.

## Coat unlocks
`COAT_UNLOCK[kind]` is the stage index that must have a star before a coat joins (-1: from the start). ぶち柴 opens after stage 2, どっしり柴 after stage 4 (`coatOpen`). Locked coats cannot enter the deck or be levelled; a saved deck holding one falls back to `DEFAULT_DECK`. The first clear that opens a coat sets `sim.newCoat`, and the result screen blinks NEW! over its portrait; locked cells show a padlock and a dim tile with the stage number to clear.

## 応援柴 (KIND_CHEER, 7th coat)
Golden きなこ coat (`KINAKO`, `FUR_KINAKO`) with a pink pennant (`drawPennant`). Deals no damage: trails the nearest non-support shiba (`cheerFree`), and every shiba within `CHEER_RADIUS` attacks `CHEER_HASTE`× as often (`hasteOf` scales the per-shiba beat as `hbeat` inside `moveFree`). Its gauge fills `CHEER_CHARGE`/s while a shiba is in range. Special ワンワン!! sets `sim.wanT` (`WANWAN_T` s of `WANWAN_HASTE`× attacks for the whole pack) and heals each shiba 15%. Unlocks after stage 6 (`COAT_UNLOCK[6] = 5`).
Seven coats need four rows on the result screen: `shopLayout` goes compact and derives `cellH` from the space above START; short cells move the deck number onto the portrait and lay the buy button's bone and cost side by side.

## Boss howl
In free placement the boss howls every `BOSS_HOWL_EVERY` s (first after `BOSS_HOWL_FIRST`; `cd` is its timer, `sim.howlAt` the last one). From stage index `BOSS_CALL_FROM` it calls `BOSS_CALL` チワワ beside it; from `BOSS_STUN_FROM` every shiba (and the hero) within `BOSS_HOWL_R` gets `stun` for `BOSS_STUN` s. Stunned shibas skip their turn in `moveFree` and show `drawDizzy` stars; the boss shakes and rolls rings out to the stun reach; `battleSounds` growls and shakes the screen.

## Pause
A ❚❚ button sits left of 2× in the dock's top row (`pauseButtonTarget`). While paused `main.ts` stops calling `advance`, taps map flat, and `paintPause` dithers the field with night pixels under PAUSE, a gold play button and the kennel (`pauseTarget`: the kennel sends `Input.quit`, which drops the match back to the title; any other tap resumes). Hiding the page (`visibilitychange`) pauses a match.

## Stage themes
`themeOf`: stages 1-3 day, 4-6 dusk (pink/gold sky bands), 7-8 night (NIGHT_1 sky with twinkling stars). Dusk and night shade the grass with a palette dither (`dither(ctx, color, step)`, a cached 2×2/4×4 `CanvasPattern`) drawn right after the lanes, so units, rocks and effects on top stay bright. The pause overlay uses the same pattern instead of per-pixel rects.
Tapping the hero itself (within `HERO_TAP_R` of a point `HERO_TAP_LIFT` above its feet, checked before recall and move) sends `Input.heroSkill`: a big spin for `HERO_SKILL_HIT` (scaled by the stage's dog hp, not on the boss) to every dog within `HERO_SKILL_R`, then `HERO_SKILL_CD` s to recharge (`sim.heroSkillT`). A ring of dots under the hero fills as it recharges and blinks when ready. `__shiba.snapshot().hero` reports its position and skill timers.

## ポメラニアン (enemy medic)
`BREED_POM` (6; the boss is now 7, `BREEDS` 7). Every `POM_EVERY` s it mends each other dog within `POM_RADIUS` by `POM_HEAL` × stage hp (never the boss; `mendAt` drives a pink plus over the dog, `bitAt` a pink pulse on the pom). With a shiba in sight it keeps `POM_KEEP` away (`pomFree`, backing straight off); otherwise it walks down like any dog. Stages 4-8 mix it in via `StageSpec.pomEvery`. Art: `DOG_HALVES[6]` (small ears, white ruff).

## 宝箱 (win chest)
A win sets `sim.chest = 1` and rolls `sim.chestBones` (`CHEST_BASE` + `CHEST_STAGE` × stage, × (1 + `CHEST_STAR` × stars), ±20% from the seed). The result screen draws the chest (`paintChest`, a 30×24 grid at 2×) where START goes, with TAP!; tapping it sends `Input.openChest` (bank the ホネ, `chest = 2`), and ホネ fly out with +N while START returns. START or the kennel with the chest still shut bank it too, so nothing is lost. The result screen's blinks and bobs now run on the wall clock (`shopClock`): the match clock stands still there. `__shiba.win()` clears the field so the match ends in a frame, for screenshots.
