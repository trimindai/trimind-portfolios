# Project Structure — Trimind Portfolios

A plain-language map of this codebase: what every folder is for and where to
find things. Nothing here changes the code — it's a guide so you (and anyone you
hand the project to) can navigate it quickly.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS ·
Convex (database) · Clerk (login) · MyFatoorah (Kuwait payments) · next-intl
(English + Arabic/RTL) · deployed on Vercel.

---

## 1. Quick orientation — "where do I find…?"

| I want to change… | Look here |
|---|---|
| The **price** (4.900 KD) | `src/lib/pricing.ts` |
| The **payment / checkout** page | `src/app/[locale]/(app)/dashboard/[id]/publish/page.tsx` |
| **MyFatoorah** payment logic (start, callback, webhook) | `src/app/api/myfatoorah/` + `src/lib/myfatoorah.ts` |
| **English / Arabic text** (translations) | `src/messages/en.json` and `src/messages/ar.json` |
| The **landing/home page** | `src/app/[locale]/page.tsx` + `src/components/landing/` |
| The **portfolio builder** (the form users fill in) | `src/components/builder/` |
| The **live template demos** (what `/demo/...` shows) | `public/demo/<template>/` |
| The **database** (portfolios, payments, users) | `convex/` |
| **Login / signup / password** screens | `src/app/[locale]/(app)/sign-in`, `sign-up`, `forgot-password` |
| **Google Analytics** events | `src/lib/ga.ts` |
| Feature switches (e.g. hosting on/off) | `src/lib/flags.ts` |
| Who gets **free/admin** access | `src/lib/admin.ts` |

---

## 2. Folder-by-folder (top level)

| Folder / file | What it is |
|---|---|
| `src/` | **All the app's source code.** The part you actually edit. (Details in §3.) |
| `convex/` | **The database + server functions** (portfolios, payments, users, auth). |
| `public/` | **Static files served as-is** — images, fonts, and the `demo/` template pages. |
| `docs/` | Design specs & implementation plans (`docs/superpowers/specs` and `/plans`). |
| `scripts/` | **Developer tools** — test/verify scripts + generated screenshots. (Index in §4.) |
| `messages` *(in `src/`)* | The EN + AR translation files. |
| `tech-keyboard/` | Source assets for the developer-template 3D keyboard. |
| `graphify-out/` | Auto-generated knowledge-graph of the codebase (don't edit by hand). |
| **Config files** (root) | `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `vercel.json`, `Dockerfile`, etc. — **required where they are.** See §5. |
| `CLAUDE.md`, `PRODUCT.md`, `DESIGN.md`, `README.md` | Project + design documentation. |

---

## 3. Inside `src/` (the code you edit)

### `src/app/` — pages and API routes (Next.js App Router)
The folder layout *is* the URL structure. `[locale]` = the language prefix
(`/en/...` or `/ar/...`).

**User-facing pages**
| Path on the site | File |
|---|---|
| Home / landing | `[locale]/page.tsx` |
| Pricing | `[locale]/pricing/page.tsx` |
| Templates gallery | `[locale]/templates/page.tsx` (+ `loading.tsx` skeleton) |
| Privacy / Terms | `[locale]/privacy`, `[locale]/terms` |
| Dashboard (your portfolios) | `[locale]/(app)/dashboard/page.tsx` |
| New portfolio | `[locale]/(app)/dashboard/new/page.tsx` |
| **Builder** (edit a portfolio) | `[locale]/(app)/dashboard/[id]/edit/page.tsx` |
| **Preview** (CV + live view) | `[locale]/(app)/dashboard/[id]/preview/page.tsx` |
| **Publish / pay** | `[locale]/(app)/dashboard/[id]/publish/page.tsx` |
| Login / Signup / Forgot password | `[locale]/(app)/sign-in`, `sign-up`, `forgot-password` |
| Admin | `[locale]/(app)/admin/page.tsx` |
| Public published portfolio | `p/[slug]/route.ts` |
| Template demos | `demo/[templateId]/route.ts` → serves `public/demo/...` |

> `(app)` is a "route group" — the parentheses are organisational only and do
> **not** appear in the URL.

**API routes** (`src/app/api/`)
| Route | Purpose |
|---|---|
| `myfatoorah/initiate` | Start a payment (returns the MyFatoorah checkout URL) |
| `myfatoorah/callback` | Where the user returns after paying → marks paid |
| `myfatoorah/webhook` | Server-to-server payment confirmation |
| `myfatoorah/error` | Payment-failure return |
| `free-access` | Grants free access to allow-listed emails |
| `generate`, `generate-cv` | Build the live portfolio / the PDF CV HTML |
| `generate-summary`, `generate-full-cv` | AI helpers in the builder |
| `cron/reconcile`, `admin/reconcile` | Reconcile payments that didn't confirm |

### `src/components/` — reusable UI pieces
| Folder | What's in it |
|---|---|
| `builder/` | The multi-step portfolio form (`steps/`, `fields/`, `BuilderForm.tsx`) |
| `landing/` | Home-page sections (hero, pricing, testimonials, try-it form) |
| `preview/` | The device-frame preview (`PreviewFrame.tsx`) |
| `ui/` | Small shared primitives |

### `src/lib/` — shared logic & helpers
| File | What it does |
|---|---|
| `pricing.ts` | The price (4.900 KD) and tolerance |
| `myfatoorah.ts` | Talks to the MyFatoorah payment API |
| `convex.ts` | Server-side database client helpers |
| `ga.ts` | Google Analytics event helper (`track(...)`) |
| `ratelimit.ts` | API rate limiter (ready to enable — see file header) |
| `flags.ts` | Feature switches (e.g. `HOSTING_ENABLED`) |
| `admin.ts` | Admin / free-access email lists |
| `templates.ts`, `template-engine.ts` | Template definitions + HTML rendering |
| `portfolio-data.ts` | Shapes raw DB data into what templates expect |
| `qr.ts` | QR-code generation for the printed CV |
| `utils.ts` | Misc small helpers |

### `src/messages/` — translations
`en.json` (English) and `ar.json` (Arabic). **Add new keys, don't remove
existing ones.** Both files must stay in sync (same keys).

---

## 4. `scripts/` — developer tools, grouped by purpose

> These are one-off / developer-only Node scripts (run with `node scripts/x.mjs`
> or `npm run mockups`). They are **not** part of the live site. Generated
> `*.png` screenshots in this folder are local scratch and are git-ignored.
> *(Grouped here for clarity; the files stay in `scripts/` because package.json,
> docs, and the scripts themselves reference those paths.)*

**Demo generators** — build the static template demos in `public/demo/`
- `gen-creative-demo.mjs`, `gen-developer-demo.mjs`

**Verification checks** — automated checks that a page/feature works
- `creator-game-check.mjs`, `creator-game-check-ar.mjs`, `dev-daylight-check.mjs`,
  `devstack-check.mjs`, `orb-phase6-check.mjs`, `render-cv-check.mjs`,
  `portfolio-fix-verify.mjs`, `socket-journey-check.mjs`, `compare-original.mjs`

**Screenshots / previews** — capture pages on phone/desktop
- `creator-live-phone.mjs`, `creator-template-preview.mjs`, `mobile-shot.mjs`

**3D / hero tuning** — for the developer template's Spline keyboard
- `tune-hero.mjs`, `tune-in-demo.mjs`, `diagnose-spline.mjs`, `probe-spline-objects.mjs`

**One-off provisioning & rendering** — real-candidate (Abdulrahman) setup
- `provision-abdulrahman-clerk.mjs`, `render-abdulrahman.mts`, `abd-pdf.mjs`

**Mockups**
- `generate-mockups.ts` — run via `npm run mockups`

---

## 5. Don't-touch list (things that must stay where they are)

- **Root config files** — `package.json`, `package-lock.json`, `tsconfig.json`,
  `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`,
  `components.json`, `vercel.json`, `Dockerfile`, `.eslintrc.json`,
  `.gitignore`, `next-env.d.ts`. Next.js and the build tools expect these at the
  project root; moving them breaks the build.
- **`src/app/` folder names** — they define the site's URLs. Renaming a folder
  changes (or breaks) a page's address.
- **Generated folders** — `.next/`, `graphify-out/`, `node_modules/`,
  `tsconfig.tsbuildinfo`. Never edit by hand; they're rebuilt automatically.

> **Shared working tree:** more than one assistant/session may work in this
> folder at once. Before committing, run `git status` and stage only your own
> files — don't sweep up another session's in-progress work (`scripts/`,
> `public/demo/developer/orb.js`, etc.).
