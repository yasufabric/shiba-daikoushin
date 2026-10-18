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

Fixed internal resolution 195×422, upscaled by an integer factor of at least 2. `imageSmoothingEnabled` stays false. 195×422 ×2 is the 390×844 phone viewport. No fractional scale and no half pixels. Round drawn positions to integers.

### Sprite sizes

- Hero shiba: 32×32, big head, head and body the same height.
- Regular cats: 24×24.
- Boss: 64×64 or larger.
- Marching crowd: 12×12, bodies in three tones. This replaces the old 8×8 sprites.
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

### Animation

Idle is 2 frames, 0.5s each. Walk and run are 4 frames at 12fps. Attack is 1 windup, 1 hit, and 2 recovery frames. A hit flash fills the sprite with `#fffaf0` for 0.06s. Defeated units fly off spinning in 90-degree steps, never a smooth rotation.

### Effects

Particles are square dots of 1, 2, or 3px. No circles, gradients, or translucency. Glow cycles the four golds. An explosion is 4 frames: white, yellow, orange, then particles. Screen shake is integer pixels, at most 3. Hitstop is 0.05s on the cannon. Damage numbers are gold with a `#120b10` border. They pop from 1.5× to 1×, and that pop stays on integer pixels (12×15, then 8×10) with no fractional scale of the glyph grid. The わんわん砲 beam follows the same rules.

Finish like a late Super Famicom game.
