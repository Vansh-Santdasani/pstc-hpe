# Pune Site Tech Council — HPE Workshop Site & CyberBlocks

A Next.js 15 site for the **Pune Site Tech Council (PSTC)** at HPE Pune. Includes a particle-animated landing page, a sessions timeline, a registration form for the upcoming Quantum-Safe workshop on April 30, and a full-featured **CyberBlocks** drag-and-drop attack-chain simulator with three scenarios mapped to MITRE ATT&CK.

---

## 1 · What's inside

```
/app
  /page.tsx                      Landing page composition
  /cyberblocks
    /page.tsx                    Main simulator
    /comparison/page.tsx         Cinematic Gen11 vs Gen12 comparison
/components
  /landing                       Hero, header, sessions, register form, etc.
  /cyberblocks                   Palette, chain, terminal, target visualizers
  /ui                            Button, card, modal, scanlines
/lib
  /blocks                        17 attack blocks with realistic transcripts
  /scenarios                     3 scenarios (Healthcare, Supply Chain, Quantum Heist)
  /engine                        Pure-function attack engine + scoring
  /audio                         Web Audio synthesizer (no asset files)
  /storage                       localStorage wrapper (typed)
  /store                         Zustand game store
/public
  /pstc-logo.png + /pstc-mark.png   Brand assets
/types/index.ts                  Single source of truth
```

**Tech stack**
- Next.js 15.1.4 · React 19 · TypeScript strict
- Tailwind CSS v4 (using the `@theme` directive)
- @dnd-kit (drag-and-drop) · Framer Motion (anims) · Zustand (state)
- Lucide React (icons) · Bricolage Grotesque + JetBrains Mono fonts

**No backend.** Everything runs client-side. Registrations are saved to localStorage. To wire a real form (Microsoft Forms, Google Forms, etc.), edit `FORMS_FALLBACK_URL` in `components/landing/register-form.tsx`.

---

## 2 · Run it locally

You need **Node.js 18.18+** (Next.js 15 minimum) — Node 20 LTS recommended.

```bash
# 1. Install deps
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:3000
```

Other scripts:
```bash
npm run build   # Production build
npm run start   # Start production server (after build)
npm run lint    # ESLint
```

---

## 3 · Deploy to Vercel (free tier — handles 50+ concurrent users easily)

The app is **fully static after first paint**. Vercel's free tier is more than enough.

### Option A — Deploy via Vercel dashboard (easiest, recommended)

1. **Create a GitHub repo and push this code:**
   ```bash
   git init
   git add .
   git commit -m "PSTC site + CyberBlocks v1"
   git branch -M main
   git remote add origin https://github.com/<your-user>/<repo-name>.git
   git push -u origin main
   ```

2. **Sign up / log in at [vercel.com](https://vercel.com)** (free Hobby plan is fine).

3. Click **Add New → Project**. Pick the GitHub repo you just pushed.

4. Vercel auto-detects Next.js. **Don't change any settings** — defaults are correct:
   - Framework: Next.js
   - Build command: `next build`
   - Output dir: `.next`
   - Install command: `npm install`

5. Click **Deploy**. ~2 minutes later you'll get a live URL like `https://pstc-cyberblocks.vercel.app`.

6. To use a custom domain, go to the project's **Domains** tab and add it.

Every push to `main` redeploys automatically.

### Option B — Deploy via Vercel CLI

```bash
npm i -g vercel
cd /path/to/this/folder
vercel               # first run — answers a couple of questions, links to a project
vercel --prod        # subsequent prod deploys
```

### Free-tier capacity check

Vercel Hobby gives you:
- **100 GB bandwidth / month**
- **Unlimited static requests**
- Serverless functions if needed (not needed here)

This site has no API routes and no SSR data — every request is either static HTML or a hashed asset. **50 concurrent users is comfortable; you'd need >5000 daily uniques to feel the limits.**

---

## 4 · Updating the upcoming session

The "Register Now" CTA is anchored on the third item in `components/landing/sessions-timeline.tsx`. To change the date, speakers, or blurb:

1. Edit the `SESSIONS` array in that file.
2. Update the matching event card in `components/landing/register-form.tsx` (date, time, venue).

To wire a real form backend, set `FORMS_FALLBACK_URL` in `register-form.tsx` to a Microsoft Forms / Google Forms / Typeform URL.

---

## 5 · Adding logos

Drop PNGs into `/public/`:
- `/public/pstc-logo.png` — wider PSTC lockup (used in hero)
- `/public/pstc-mark.png` — square PSTC mark (used in header + footer)

Currently both point to the same file. Replace whenever finalized.

---

## 6 · Adding a CyberBlocks scenario

1. Create `lib/scenarios/your-scenario.ts` exporting a `Scenario` object (see `quantum-heist.ts` for the most complete example).
2. If you need new blocks, add them to `lib/blocks/library.ts`.
3. Register the scenario in `lib/scenarios/index.ts` by importing and adding to the `SCENARIOS` array.
4. If your scenario needs a new target visualization, add a `target-yourkind.tsx` to `components/cyberblocks/` and route it from `target-system.tsx`.

The engine in `lib/engine/attack-engine.ts` is purely declarative — it just walks the chain against the scenario's `solution` array and emits step-by-step results. No engine changes needed for new scenarios as long as they fit the existing schema.

---

## 7 · Block transcript grammar

Each attack block has a `successLines: string[]` array. The terminal parses prefixes for cinematic rendering:

| Prefix | Rendered as | Example |
|--------|-------------|---------|
| `>> `  | Shell prompt + bold command | `>> nmap -sV vendor.targetcorp.io` |
| `## `  | Cyan section header | `## [reconnaissance] target:` |
| `-- `  | Muted output | `-- [+] Found 11 compatible encoders` |
| `++ `  | Green success | `++ payload accepted` |
| `!! `  | Red error/warning | `!! ERROR :: no payload delivered` |
| `~~ `  | Animated progress | `~~ delivering [47/47]` |
| `== `  | Cyan stage divider | `== INITIAL ACCESS :: vector seeded ==` |
| (blank)| Blank line | |
| (other)| Plain output | |

Match this style when adding new blocks for a consistent feel.

---

## 8 · Customizing the theme

All theme tokens are CSS variables defined in `app/globals.css` under the `@theme` block. To swap accent colors, change the values there — Tailwind v4 picks them up automatically.

```css
@theme {
  --color-obsidian: #0a0e0f;       /* Background */
  --color-hpe: #01a982;            /* HPE green primary */
  --color-hpe-bright: #00ffb2;     /* Hover/accent */
  --color-amber: #ffb000;          /* Warnings */
  --color-crimson: #ff003c;        /* Failures, attacks */
  --color-cyan: #00d4ff;           /* Info, headers */
  /* ... */
}
```

---

## 9 · Things to know

- **Audio is on by default.** Toggle in the CyberBlocks HUD. Preference persists in localStorage.
- **Onboarding tour** runs once on first visit to `/cyberblocks`. Replay via the help icon in the HUD.
- **localStorage keys** used: `ptc.cyberblocks.scores.v1`, `ptc.cyberblocks.tour.v1`, `ptc.cyberblocks.audio.v1`, `pstc.registrations.v1`.
- **The Gen11 vs Gen12 cinematic** is at `/cyberblocks/comparison`. Linked from the HUD and the footer.
- **No external API calls at runtime.** Google Fonts is the only outbound request (loaded via `<link>` in `app/layout.tsx`).

---

## 10 · Troubleshooting

- **"Module not found" after pulling fresh:** delete `node_modules` and `.next`, re-run `npm install`.
- **Tailwind classes not applying:** make sure `@tailwindcss/postcss` is in `postcss.config.mjs` (Tailwind v4 uses a different PostCSS plugin than v3).
- **Particle animation choppy on low-end devices:** reduce `N` (particle count) inside `components/landing/pstc-particles.tsx` — currently 800.

---

Built by the Pune Site Tech Council, for the Pune Site Tech Council.
*Ideas, assembled.*
