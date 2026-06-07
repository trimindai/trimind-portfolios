# Kimi MOBILE QA prompt — Trimind Portfolios (full workflow on phones)

Paste everything inside the fenced block into Kimi. Self-contained (Kimi has no repo access).

Test account (real, production Clerk, password-only — no OTP):
- Email: `kimi.qa@trimindai.com`
- Password: `KimiQA!Portfolio2026`

---

````
You are a senior MOBILE QA automation engineer. Test the ENTIRE user WORKFLOW of my
web app "Trimind Portfolios" on PHONES — every step of the journey, on real mobile
viewports, in English and Arabic (RTL). You have no source-code access; everything is
below. The focus is the WORKFLOW (the end-to-end path a real phone user takes), and
mobile-specific quality (no horizontal scroll, tap targets, safe areas, RTL, on-screen
keyboard, the interactive 3D/game demos, and the payment page on mobile).

Produce TWO deliverables:
  (A) A MOBILE WORKFLOW TEST PLAN — a table that walks the full journey step by step,
      each row: step, screen/route, action, mobile-specific expected result, device(s),
      priority (P0/P1/P2), type (happy/edge/negative/a11y/perf/RTL).
  (B) A RUNNABLE PLAYWRIGHT + TYPESCRIPT MOBILE E2E SUITE that implements the P0/P1
      steps using DEVICE EMULATION (real mobile viewports, touch, devicePixelRatio).
      Include playwright.config.ts with mobile `projects` built from Playwright device
      descriptors, package.json, .env.example, a signed-in fixture (storageState),
      page objects, and spec files per workflow stage. Add a reusable helper that
      asserts on every page: (1) NO horizontal scroll (scrollWidth <= innerWidth+1),
      (2) all interactive controls have a tap target >= 44x44 CSS px, (3) no element
      overflows the viewport width, (4) no uncaught console errors. Tag tests
      @p0/@smoke/@rtl/@ios/@android. Make tests independent + idempotent. Include
      .github/workflows/mobile-e2e.yml and a README with exact run commands.

=================================================================================
DEVICE MATRIX (emulate all; run the full workflow on at least iPhone 13 + Pixel 5)
=================================================================================
- iPhone SE  (375x667, dpr 2, iOS Safari UA)      — smallest common iPhone
- iPhone 13  (390x844, dpr 3)                      — primary iOS
- Pixel 5    (393x851, dpr 2.75)                   — primary Android
- Galaxy S8  (360x740)                             — small Android (tightest width)
- iPad mini  (768x1024)                            — tablet sanity
In Playwright use `devices['iPhone 13']`, `devices['Pixel 5']`, etc. (these set
viewport + isMobile + hasTouch + deviceScaleFactor + UA). Test PORTRAIT primarily;
do one landscape sanity pass of the builder + payment.

=================================================================================
ENVIRONMENT & CREDENTIALS
=================================================================================
- Base URL (production): https://portfolio-trimind.com
- Locale is a path prefix: /en/...  and  /ar/...  (ar = right-to-left, must mirror)
- Test user (already created, email verified, password signs in — NO OTP/2FA):
      email:    kimi.qa@trimindai.com
      password: KimiQA!Portfolio2026
- This is PRODUCTION (real Clerk, Convex, MyFatoorah). See CONSTRAINTS — no real money,
  no new sign-ups.
- Current product state to expect:
  * Paid deliverable = a PDF CV (one-time 4.900 KD via MyFatoorah). Payment WORKS and
    redirects to a MyFatoorah hosted page; after paying, the portfolio unlocks a
    "download PDF" state.
  * Live web-portfolio hosting is PAUSED right now: /p/<published-slug> returns a 503
    "Coming soon" page, and /p/<nonexistent-slug> returns a clean 404. The preview
    screen still has a "CV <-> Live portfolio" toggle.

=================================================================================
THE WORKFLOW — test this whole path on each device, in /en and /ar
=================================================================================
Walk it as ONE continuous mobile journey; at EVERY screen run the global mobile checks
(no horizontal scroll, tap targets >= 44px, nothing clipped, no console errors).

STEP 0 — Landing (/{locale})
  - Loads fast on a phone; hero, pricing (4.900 KD), FAQ, CTAs all readable without
    zooming or sideways scroll. Locale switch flips language AND dir=rtl.
  - The hero "Try it now" form: tapping the name/title inputs brings up the keyboard
    without breaking layout; submitting EMPTY shows a validation error (does not
    proceed); filling both proceeds. Primary CTA routes a logged-out user to sign-in.

STEP 1 — Sign in (/{locale}/sign-in)
  - Form fits the screen; email field uses an email keyboard; password is masked.
  - Sign in with the test creds → lands on /{locale}/dashboard. (No OTP screen.)
  - Wrong password shows a generic "Invalid email or password." inline (no app crash).
  - Logged-out access to /dashboard or /dashboard/* redirects to sign-in.

STEP 2 — Dashboard (/{locale}/dashboard)
  - Renders the user's portfolios + a "Create New Portfolio" CTA; empty state is sane.
  - The top bar (name + Sign out) doesn't overlap content or wrap badly on 360px.

STEP 3 — Start a build (/{locale}/dashboard/new)
  - Creating from a template opens the BUILDER WIZARD on a phone.
  - Run the wizard for EACH live template: general, engineer, creative, developer,
    creator. On mobile verify: step fields stack (no 2/3-col cramming), the on-screen
    keyboard doesn't cover the active input, required-field validation blocks "Next",
    Back/Next preserve data, the progress indicator + step nav are reachable with a
    thumb, and any color/customize controls work by touch.

STEP 4 — Preview (/{locale}/dashboard/{id}/preview)
  - The "CV <-> Live portfolio" toggle works by tap.
  - The CV (A4) renders legibly on a phone (pinch-zoom allowed, but the page chrome
    must not horizontally scroll). In /ar it is RTL-mirrored with Arabic headings and
    Latin/numbers kept LTR.
  - For an UNPAID portfolio the download/print action is gated behind a "Get PDF —
    4.900 KD" CTA (no silent download).

STEP 5 — Checkout + Payment (/{locale}/dashboard/{id}/publish)  [SEE CONSTRAINTS]
  - The checkout card fits the screen; price shows 4.900 KD (٤٫٩٠٠ in /ar).
  - Tapping "Pay & download PDF" (/ar: "ادفع وحمّل PDF") REDIRECTS to the MyFatoorah
    hosted payment page. ASSERT the redirect to a *.myfatoorah.com host happens, the
    page is responsive on the phone, shows 4.900 KD, and offers Apple Pay / Google Pay
    / KNET / card. THEN STOP — do not enter card details, do not pay.
  - A user with NO phone number on their profile must still reach this page (do not
    expect a phone-required block).
  - On payment failure the app shows a friendly message, NOT a raw API/JSON error.

STEP 6 — Post-payment (describe in plan; only automate if you can reach a paid state
  WITHOUT real money, gated behind RUN_PAID_FLOW=1)
  - After a successful payment the portfolio unlocks a "download PDF" state and the
    PDF carries a QR code to the (currently paused) /p/<slug> live portfolio.

STEP 7 — Public links & errors (mobile)
  - /p/<nonexistent-slug> → clean 404 page (renders fine on mobile, no sideways scroll).
  - /p/<published-slug> → the 503 "Coming soon" page (hosting paused) renders fine.
  - Privacy + Terms pages (/{locale}/privacy, /{locale}/terms) are readable on a phone
    (dark text on white, lists visible) in EN and AR.

=================================================================================
INTERACTIVE DEMOS ON MOBILE (key mobile risk area — /templates -> "Live preview")
=================================================================================
- /demo/creative : a 3D spiral "cone" gallery. On phones the cone must be SCALED DOWN,
  contained (no bleed over the hero/nav), and a hamburger menu must open the nav links
  (Gallery/Skills/Contact). No horizontal overflow; hero name not clipped at 360-390px.
- /demo/developer : a 3D Spline keyboard. If the 3D/Spline CDN is blocked or the device
  is low-power, it MUST degrade gracefully to a static star-field/grid and never hang
  (hard preloader timeout). Touch scrolling must work.
- /demo/creator : a PLAYABLE memory-match game, phone-first. Cards are tappable with
  >=44px targets, there is a "Skip -> see the work" path, Contact is always reachable,
  and a full playthrough can reach the win screen. Sound has a mute control.
- /demo/general and /demo/engineer : static; load with 0 console errors, no overflow,
  and the engineer demo's placeholder buttons (Resume / report / source) are disabled
  ("Available on request"), not dead links.

=================================================================================
MOBILE-SPECIFIC GLOBAL CHECKS (assert across the workflow)
=================================================================================
1. NO horizontal scrolling on any screen at 360 / 375 / 390 / 393 px widths.
2. Tap targets: every button/link/input >= 44x44 CSS px (WCAG 2.5.5 / iOS HIG).
3. Fixed/sticky elements (top bars, hamburger panels, floating CTAs, scroll-progress,
   payment "Pay Now") respect iOS safe-area insets (env(safe-area-inset-*)) — no
   overlap with the notch/home-bar; nothing covers the active input.
4. On-screen keyboard: tapping inputs doesn't break layout; correct keyboard types
   (email/number) where applicable; the focused field stays visible (scrolls into view).
5. RTL (/ar): layout mirrors, dir=rtl, text right-aligned, NO untranslated raw i18n
   keys leak; numbers/price stay LTR and correct (4.900 / ٤٫٩٠٠).
6. Orientation: one landscape pass of builder + payment (no broken layout).
7. Accessibility (mobile smoke): one <h1> per page, inputs have labels, focus visible,
   images have alt; run axe-core on landing, sign-in, one demo, and checkout — report
   serious/critical issues.
8. Performance (mobile smoke): optionally throttle CPU 4x and network to Fast 3G for
   the landing + one demo; report obvious jank, long blocking, or failed (4xx/5xx)
   requests. No uncaught console errors anywhere.

=================================================================================
CONSTRAINTS (production)
=================================================================================
- NEVER complete a real payment — stop at the MyFatoorah hosted page.
- Do NOT create new sign-ups (captcha + real accounts). Use the provided test user.
- Builder steps DO create draft portfolios under the test account — prefix names with
  "QA-MOBILE-" + a timestamp; note an optional cleanup step (delete drafts via the UI
  if a delete exists).
- Be gentle: no load/stress, no parallel hammering of payment endpoints.
- Gate anything needing real money (paid PDF/QR) behind RUN_PAID_FLOW=1 (off by default).

=================================================================================
OUTPUT FORMAT
=================================================================================
1) The MOBILE WORKFLOW TEST PLAN table (markdown), ordered by STEP 0..7 then the demos
   and the global checks.
2) The Playwright project as a file tree, then each file in its own fenced code block
   headed by its path (e.g. "### tests/workflow.mobile.spec.ts"). Include at minimum:
   playwright.config.ts (mobile projects via devices[...]), package.json, .env.example,
   tests/fixtures/auth.ts (signed-in storageState using the test creds),
   tests/helpers/mobile.ts (the no-overflow + 44px tap-target + console-error asserts),
   tests/pages/*.ts, and specs: landing, signin, dashboard, builder (parametrized over
   the 5 templates), preview, payment, demos, public-errors, i18n-rtl. Plus the CI yml
   and README.
3) A "How to run" section: install, `npx playwright install`, set env, run, and how to
   enable RUN_PAID_FLOW.

Make the code real and runnable. You can't see the DOM, so prefer role/text/label
selectors and add "// TODO: confirm selector" where you guess. Begin with the test
plan, then the code.
````
