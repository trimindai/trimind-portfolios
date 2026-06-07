# Kimi QA — Template Builder Test Prompt

Self-contained prompt for driving Kimi (or any browser-capable agent) through the
portfolio **template builder** for every user-available template type, as a normal
full-access user (not admin).

- **Created:** 2026-06-06
- **Test account:** `trimindartificial@gmail.com` — full-access USER, **not** admin
  (on `FREE_ACCESS_EMAILS` so it can build + publish for free; Clerk user
  `user_3EmJPx2ENmn7UXETfFWuq5eNJnI`). Login verified end-to-end, no 2FA.
- **Scope:** the 4 user-available templates (general, engineer, creative, creator).
  `developer` is admin-preview-only and intentionally hidden from this account.
- **Related:** broader site-wide suite in [`KIMI-QA-TEST-PROMPT.md`](./KIMI-QA-TEST-PROMPT.md).

---

## Prompt (copy/paste to Kimi)

```
You are a QA tester for a portfolio-builder web app. Your job: exercise the
TEMPLATE BUILDER for every user-available template type, as a normal user, and
report any bug, broken step, validation error, console error, or layout problem.

SITE: https://portfolio-trimind.com
LOGIN (full-access regular user — NOT an admin):
  Email:    trimindartificial@gmail.com
  Password: TrimindKimi@2026!
  (Clerk user id: user_3EmJPx2ENmn7UXETfFWuq5eNJnI)

SIGN IN:
  1. Open https://portfolio-trimind.com/en/sign-in
  2. Enter the email + password, submit.
  3. You should land on /en/dashboard with NO email code / 2FA step.
     If you get stuck on "verification required", that's a bug — report it.

ACCOUNT CAPABILITIES:
  - This account can BUILD and PUBLISH portfolios for free (it's on the free-
    access allowlist) — no real payment needed. Publishing is fine to test.
  - It is NOT an admin: there is no /admin panel and the "developer" template is
    intentionally hidden ("coming soon"). Do NOT report developer's absence as a
    bug — it is expected for non-admin users.

TEMPLATES TO TEST (all 4 user-available types). Start each build by opening its
URL directly, OR via /en/templates → "Use this template":

  1. general  →  https://portfolio-trimind.com/en/dashboard/new?template=general
       Steps: Basics(req: full name, title, email) → Experience(req: ≥1 entry) →
       Achievements → Skills → Education → CV Details → Endorsements → Customize
  2. engineer →  https://portfolio-trimind.com/en/dashboard/new?template=engineer
       Steps: About(req: name, title, email) → Projects(req: ≥1) → Background →
       CV Details → Customize
  3. creative →  https://portfolio-trimind.com/en/dashboard/new?template=creative
       Steps: Profile(req: name, title, email) → Gallery(req: ≥1 item) → About →
       CV Details → Customize
  4. creator  →  https://portfolio-trimind.com/en/dashboard/new?template=creator
       Steps: Profile(req: name, title, email) → Work(req: ≥1 item) →
       Audience & Awards → Brands → CV Details → Customize

FOR EACH TEMPLATE, do a full pass:
  a. Fill every required field with realistic test data. Prefix the person's name
     with "TEST " (e.g. "TEST Remi Vance") so the data is identifiable.
  b. Add at least one Experience/Project/Gallery/Work item as required.
  c. Try to advance past a required step while leaving a required field EMPTY —
     confirm the form blocks you with a clear validation message.
  d. Fill optional steps too (at least once across the run).
  e. Use the Customize step (colors/options) and confirm it applies.
  f. Open Preview; toggle between the CV view and the Live/site view; confirm both
     render the data you entered.
  g. Publish the portfolio; confirm it succeeds without asking for payment and that
     the public URL (/p/<slug>) loads and shows your data.
  h. Repeat the whole flow in Arabic by swapping /en/ for /ar/ at least once, and
     check RTL layout (text alignment, mirrored UI) looks correct.

REPORT, per template:
  - Pass/fail for each step (build, validation, preview CV↔Live, publish, public page).
  - Exact reproduction steps for any failure.
  - Any browser console errors or network request failures (status ≥ 400).
  - Any visual/layout/RTL issues, with what you expected vs. saw.
  - Anything confusing in the UX even if not strictly broken.

CONSTRAINTS:
  - This is the LIVE production site with real data — only create clearly-labelled
    TEST portfolios; do not modify or delete anything that isn't yours.
  - Do not attempt admin actions; this is a user-level test.
```
