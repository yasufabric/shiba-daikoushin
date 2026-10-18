# しば大行進

Portrait phone game. Shibas march up the field, cat swarms come down, and a three-minute match ends at the cat castle. The only input is deploying a card. At 50 shibas the わんわん砲 clears the field.

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

Later PRs follow this standard. Simulation coordinates stay on the 390×844 field so speeds, spawns, cards, the cannon, and the three-minute clock do not move. The renderer snaps every drawn coordinate onto the internal grid.

### Resolution

Design grid 195×422. Pick the largest integer scale that fits that grid in the viewport, then grow the internal buffer so the scaled canvas covers the screen. Width stays near 195 when the phone matches the design; height or width flex on other aspect ratios. `imageSmoothingEnabled` stays false. No letterboxing, no fractional scale, and no half pixels. 195×422 ×2 is the 390×844 phone. The night backdrop covers every extra pixel, including under the notch. Round drawn positions to integers. The page uses `100dvh`, `visualViewport`, and `viewport-fit=cover`.

### Sprite sizes

- Hero shiba: 32×32, big head, head and body the same height.
- Regular cats: 24×24.
- Boss: 64×64 or larger.
- Marching crowd: 16×16. Up to four fur colors plus the outline. This replaces the old 12×12 sprites.
- Damage numbers: a dedicated pixel font, 8×10 per glyph.

### Palette

Only these colors:

- Shiba fur: `#6b2e12` `#a8521e` `#e08a3c` `#f6c27a`
- White: `#8a7f86` `#c9c0c4` `#fffaf0`
- Cats: `#2b1d3a` `#5a3f7a` `#9a7ccf` `#d8c8f0`
- Gold, for damage, bones, and our shots: `#7a4a00` `#e0a200` `#ffe066` `#fffbd1`
- Enemy shots and danger: `#8a0f3a` `#ff3d7f` `#ffb3cf`
- Night background: `#0b0f1e` `#18213d` `#2c3a63` `#4a5d8f`
- Line: `#120b10`

### Drawing

Characters get a 1px outline. The outer edge is `#120b10`. Inner lines use the darker shade of that color. Backgrounds have no outline. No jaggies and no isolated single pixels. Light comes from the top-left, in two shade steps.

### Shiba read

The crowd sprite and the 32×32 card portrait are the same front-facing shiba. A later PR keeps this read. At 16×16, in this order:

- Two pointed upright triangular ears. The left ear is lit `#e08a3c`, the right ear is in shadow `#a8521e`.
- Orange and tan fur with cream and white cheeks, muzzle, and chest (`#fffaf0`, `#f6c27a`).
- A dark nose, `#6b2e12`.
- A curled tail over the hip with a cream center.

The portrait is that same view with a larger head, eye highlights, and a thicker curl. The cream card keeps orange ears and an orange tail.

### Animation

Idle is 2 frames, 0.5s each. Walk and run are 4 frames at 12fps. Attack is 1 windup, 1 hit, and 2 recovery frames. A hit flash fills the sprite with `#fffaf0` for 0.06s. Defeated units fly off spinning in 90-degree steps, never a smooth rotation.

### Effects

Particles are square dots of 1, 2, or 3px. No circles, gradients, or translucency. Glow cycles the four golds. An explosion is 4 frames: white, yellow, orange, then particles. Screen shake is integer pixels, at most 3. Hitstop is 0.05s on the cannon. Damage numbers are gold with a `#120b10` border. They pop from 1.5× to 1×, and that pop stays on integer pixels (12×15, then 8×10) with no fractional scale of the glyph grid. The わんわん砲 beam follows the same rules.

Finish like a late Super Famicom game.

### Match end

Destroying the cat castle plays hitstop, a 4-frame explosion on the castle (white, yellow, orange, then square particles), a shiba hop, and a gold `CLEAR!` banner. The banner pops from 1.5× to 1× on integer pixels, holds for 2.4s, then the new-card reward appears. A loss shows a `LOSE!` banner for the same beat, then the match retries. No explanatory sentence.
