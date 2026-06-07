# Kimi QA prompt — Trimind Portfolios

Paste everything inside the fenced block below into Kimi. It is fully self-contained
(Kimi has no access to the codebase — all context it needs is in the prompt).

Test account (real, on production Clerk, email pre-verified — no email code needed):
- Email: `kimi.qa@trimindai.com`
- Password: `KimiQA!Portfolio2026`

---

````
You are a senior QA automation engineer. I want you to build a COMPLETE test suite that
exercises EVERYTHING in my web app, "Trimind Portfolios" — a multi-template portfolio /
CV builder. You do not have access to the source code; everything you need is below.

Produce TWO deliverables:

  (A) A QA TEST PLAN — a structured table covering every feature area, with: test ID,
      area, scenario, precondition, steps, expected result, priority (P0/P1/P2), and
      type (happy-path / edge / negative / a11y / responsive / security).

  (B) A RUNNABLE PLAYWRIGHT + TYPESCRIPT E2E SUITE that implements the P0/P1 cases —
      real, complete `.spec.ts` files I can save and run, plus `playwright.config.ts`,
      a `package.json` with scripts, a `.env.example`, fixtures/helpers (auth helper,
      base test), and a short README with exact setup + run commands. Use
      `@playwright/test`, Page Object Model, web-first assertions (`expect(locator)`),
      `data-testid` where sensible but fall back to role/text selectors, and tag tests
      with annotations (`@p0`, `@smoke`, `@mobile`, `@rtl`). Make tests independent and
      idempotent. Include CI config (`.github/workflows/e2e.yml`) running on chromium +
      mobile-chrome projects.

=================================================================================
PRODUCT
=================================================================================
Trimind Portfolios lets a user sign in, build a portfolio through a step-by-step
wizard, preview it (as an ATS-friendly PDF CV *or* a live web portfolio), pay a small
one-time fee, then download a polished PDF CV that carries a QR code linking to their
hosted live portfolio. There are 5 live design templates plus an admin panel and full
English/Arabic (RTL) localization.

STACK (for your awareness — black-box test it, don't assume internals):
- Next.js 15 (App Router) + React 19 + TypeScript + Tailwind
- Auth: Clerk (production instance, email+password and Google OAuth)
- Backend/DB: Convex
- Payments: MyFatoorah (Kuwait), one-time fee = 4.900 KD
- i18n: next-intl, locales `en` (LTR) and `ar` (RTL)

=================================================================================
ENVIRONMENT & CREDENTIALS
=================================================================================
- Base URL (production):  https://portfolio-trimind.com
- Locale is a path prefix:  /en/...  and  /ar/...  (ar renders right-to-left)
- Test user (already created, email verified, password works on the sign-in page):
      email:    kimi.qa@trimindai.com
      password: KimiQA!Portfolio2026
      (verified working: email+password signs in and lands on /{locale}/dashboard,
       no email OTP / second factor — password is enough.)
- This is a PRODUCTION environment. See CONSTRAINTS — DO NOT complete real payments.

=================================================================================
ROUTE MAP (what exists — test all of it)
=================================================================================
PUBLIC (no auth):
  /{locale}                         Landing page (marketing, pricing, FAQ, CTAs)
  /{locale}/templates               Template gallery (cards + "Live preview" links)
  /{locale}/privacy                 Privacy policy
  /{locale}/terms                   Terms
  /demo/general                     Live template demo (static)
  /demo/engineer                    Live template demo (static)
  /demo/creative                    Live template demo (3D spiral cone gallery SPA)
  /demo/developer                   Live template demo (3D Spline keyboard, "Spacebar")
  /demo/creator                     Live template demo = a PLAYABLE memory-match game
  /p/{slug}                         A user's published live web portfolio
  /p/{slug}/projects/{projectSlug}  A project detail page within a portfolio

AUTH (Clerk):
  /{locale}/sign-in                 Sign in (email+password, Google OAuth)
  /{locale}/sign-up                 Sign up (email+password w/ captcha, Google OAuth)
  /{locale}/sso-callback            OAuth redirect handler

AUTHED APP (redirects to sign-in if logged out):
  /{locale}/dashboard               List of the user's portfolios + "New" button
  /{locale}/dashboard/new           Pick a template to start a new portfolio
  /{locale}/dashboard/{id}/edit     The multi-step BUILDER WIZARD (the core flow)
  /{locale}/dashboard/{id}/preview  Preview with a "CV  ⇄  Live portfolio" toggle;
                                    has Save-PDF / Print actions (gated until paid)
  /{locale}/dashboard/{id}/publish  Checkout — pay 4.900 KD to unlock the PDF
  /{locale}/admin                   Admin panel (only allow-listed emails; the test
                                    user is NOT an admin → must see Access Denied)

API (assert status/redirects, don't need deep contract tests unless P2):
  POST /api/generate                Renders the live web portfolio HTML
  POST /api/generate-cv             Renders the ATS PDF CV HTML
  POST /api/free-access             Admin/free unlock path
  POST /api/myfatoorah/initiate     Starts a payment (returns a MyFatoorah redirect)
  GET  /api/myfatoorah/callback     Payment return handler
  GET/POST /api/myfatoorah/error    Payment error handler
  POST /api/myfatoorah/webhook      Payment webhook
  POST /api/admin/reconcile         Admin reconciliation

=================================================================================
TEMPLATES (5 live) — each has a builder flow, a live demo, and renders a portfolio
=================================================================================
  general    (formerly "corporate"; default professional template)
  engineer   (oil & gas / engineering; has per-project detail pages)
  creative   (artists/designers/photographers; dark + lime, 3D spiral cone of projects,
              gallery lightbox, testimonials, awards, Instagram, mobile hamburger nav)
  developer  ("Spacebar" — space theme, clickable 3D Spline keyboard of skills)
  creator    (content creators; the LIVE DEMO is a playable memory-match game with
              3 levels + a "connect contacts" win round; sound/mute, score, haptics)
NOTE: old template id "corporate" is an alias for "general" — both must still work.

=================================================================================
FEATURE AREAS TO COVER (be exhaustive — this is "test everything")
=================================================================================
1. LANDING & MARKETING
   - Loads in both /en and /ar; hero, pricing (4.900 KD), FAQ, CTAs render.
   - All nav links + footer links resolve (no 404s).
   - Locale switch toggles language AND text direction (ar = dir="rtl").
   - Primary CTA routes a logged-out user to sign-in/sign-up.

2. TEMPLATE GALLERY (/templates)
   - All 5 live templates show as available cards with a working "Live preview".
   - Each "Live preview" opens the correct /demo/{id} and returns HTTP 200.

3. LIVE DEMOS (/demo/*)
   - Each of the 5 demos loads with 0 console errors and no horizontal overflow.
   - creative: 3D cone renders on desktop, scaled on mobile, hamburger nav works.
   - developer: page loads even if the Spline/3D CDN is blocked (progressive
     enhancement — must degrade to a static fallback, never hang).
   - creator: the memory game is reachable, has a "Skip → see the work" path, and a
     Contact action is always available; a full playthrough can reach the win screen.

4. AUTH
   - Sign-in page renders; signing in with the test credentials lands on /dashboard.
   - Wrong password shows an inline error and does NOT authenticate.
   - Logged-out access to /dashboard, /dashboard/new, /dashboard/{id}/* redirects to
     sign-in.
   - Sign-out returns to a logged-out state (protected routes redirect again).
   - Sign-up page renders email+password fields + Google button + a captcha widget.
     (Do NOT complete a new sign-up — captcha + real account creation; just assert the
     form and captcha element exist.)

5. DASHBOARD
   - Lists the signed-in user's portfolios; "New portfolio" → /dashboard/new.
   - Empty state is sane for a brand-new account.

6. BUILDER WIZARD (the core flow — run for EACH of the 5 templates)
   - From /dashboard/new, selecting a template creates a draft and opens the wizard.
   - Steps render template-appropriate fields (e.g. creative has a Projects/Gallery
     step feeding the 3D cone; developer has a skills/keycaps step; engineer has
     project detail fields). Required-field validation blocks "Next" when empty.
   - Back/Next preserve entered data; progress indicator advances.
   - Filling minimal valid data lets you reach the Preview step.
   - Customization (primary/accent/background color) reflects in the preview.

7. PREVIEW
   - The "CV ⇄ Live portfolio" toggle switches between the ATS PDF CV view and the
     live web portfolio view.
   - For an UNPAID portfolio, the Save-PDF / Print / Download action is gated (shows a
     "Get PDF — 4.900 KD" CTA instead of downloading).
   - The CV view is single-column A4 with the 9 hiring sections (Summary, Experience,
     Education, Skills, Projects, Certifications, Languages, References) and a QR code.
   - Renders correctly in /ar (RTL mirrored, Arabic headings, numbers stay LTR).

8. PAYMENT (4.900 KD via MyFatoorah) — SEE CONSTRAINTS
   - From /dashboard/{id}/publish, "Pay" calls initiate and REDIRECTS to a MyFatoorah
     hosted payment page. ASSERT the redirect to the MyFatoorah domain happens — then
     STOP. Do not enter card details / do not complete payment.
   - Visiting the callback/error routes with no/invalid payment params is handled
     gracefully (no crash, sensible message or redirect).

9. PDF + QR (post-payment behaviour — describe in the plan; only automate if you can
   reach a paid state without real money, e.g. via an admin/free-access path)
   - Paid state unlocks the PDF download; the PDF embeds a QR code that decodes to the
     user's /p/{slug} live portfolio URL.

10. PUBLISHED PORTFOLIO (/p/{slug})
   - A valid published slug renders the live web portfolio (matching its template).
   - An unknown slug returns 404 (NOT a 500/blank).
   - Project detail pages /p/{slug}/projects/{projectSlug} render for templates that
     have them (engineer, creative); unknown project slug → 404.
   - Has correct SEO: <title>, meta description, og:image, canonical, and JSON-LD.

11. ADMIN (/admin)
   - The test user (kimi.qa@trimindai.com) is NOT an admin → must see an "Access
     Denied" state, never the admin data.

12. INTERNATIONALIZATION / RTL
   - Every public page works in both /en and /ar.
   - /ar sets dir="rtl" on <html> (or main container) and layout mirrors.
   - No untranslated raw i18n keys (e.g. no literal "landing.hero.title") leak to UI.

13. RESPONSIVE / MOBILE
   - Key pages (landing, templates, each demo, sign-in, dashboard, preview) have NO
     horizontal scroll at 390×844 (iPhone) and 768 (tablet); tap targets ≥ 44px on
     interactive controls.

14. ACCESSIBILITY (smoke level)
   - Pages have one <h1>, images have alt text, form fields have labels, focus is
     visible, and you can tab to primary actions. Run an axe-core scan on landing,
     templates, sign-in, and one demo; report serious/critical violations.

15. PERFORMANCE / ROBUSTNESS (smoke level)
   - No uncaught console errors or failed network requests (4xx/5xx) on the public
     pages and demos. Landing TTFB/visual load is reasonable.

16. SECURITY (light, non-destructive)
   - Protected routes are not accessible while logged out (already in #4).
   - The unknown-slug and bad-payment-param cases don't leak stack traces.
   - Do NOT attempt injection/DoS/credential attacks against production.

=================================================================================
CONSTRAINTS (IMPORTANT — production environment)
=================================================================================
- This runs against PRODUCTION (real Clerk, real Convex, real MyFatoorah). Therefore:
  * NEVER complete a real payment. Payment tests stop at the MyFatoorah redirect.
  * Do NOT create new sign-ups (captcha + real accounts). Use the provided test user.
  * Builder tests DO create draft portfolios under the test account — that's fine, but
    name them with a "QA-" prefix + a timestamp so they're identifiable, and add an
    OPTIONAL cleanup note (deleting drafts via the dashboard UI if a delete exists).
  * Be gentle: no load/stress testing, no parallel hammering of payment endpoints.
- Treat anything you can't reach without real money (paid PDF, QR decode) as a
  DOCUMENTED manual test in the plan, and gate its automation behind an env flag
  (e.g. `RUN_PAID_FLOW=1`) so it's off by default.

=================================================================================
OUTPUT FORMAT
=================================================================================
1) The QA TEST PLAN table (markdown), grouped by the 16 feature areas above.
2) The Playwright project as a file tree, then each file in its own fenced code block
   with its path as the heading, e.g.:
       ### tests/auth.spec.ts
       ```ts
       ...
       ```
   Include at minimum: playwright.config.ts, package.json, .env.example,
   tests/fixtures/auth.ts (a reusable signed-in fixture using the test creds via
   storageState), tests/pages/*.ts (page objects), and spec files per area:
   landing, templates, demos, auth, dashboard, builder (parametrized over the 5
   templates), preview, payment, published-portfolio, admin, i18n-rtl, responsive,
   a11y. Plus .github/workflows/e2e.yml and a README.
3) A short "How to run" section: install, set env, `npx playwright test`, and how to
   enable the gated paid flow.

Make the code real and runnable, not pseudocode. Prefer resilient selectors (role/
text/label) since you can't see the DOM; add `// TODO: confirm selector` comments
where you're guessing, so I can adjust quickly. Begin with the test plan, then the code.
````
