# Portfolio Pro

Next.js 15 + React 19 + Convex + Clerk + Tailwind CSS. Bilingual (EN/AR with RTL). MyFatoorah payments (Kuwait).

## Design Context

See `PRODUCT.md` (strategic) and `DESIGN.md` (visual) at the project root. Both are loaded automatically by `/impeccable` commands.

**Two surfaces, two directions:**

- **Landing / marketing (2026-06-27): "Ink / Green / Gold"** — light paper (#FAFBFC), ink text (#0D1117), green accent (#22A063), gold trust accents (#C8862A), soft shadows allowed, IBM Plex Sans Arabic for AR. Tokens: `globals.css` `--land-*` + `tailwind.config.ts` `ink`/`green`/`gold`. This is the source of truth for the landing.
- **Builder / dashboard app chrome: "The Quiet Atelier"** — single accent (now green via `--land-accent`), flat, Geist-only, restrained. Governed by `DESIGN.md`.
- **Anti-references (both):** AI-slop aesthetic, cheap page builders, generic SaaS cream.
