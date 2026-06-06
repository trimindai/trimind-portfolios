# Portfolio Pro — "Fix All Issues" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve every launch-blocking and conversion bug in the QA report for `portfolio-trimind.com`, grounded against the *real* codebase (not the spec's guessed paths/personas), de-duplicated against in-flight work already in the tree.

**Architecture:** Next.js 15 (App Router) + React 19 + Convex + Clerk + next-intl (en/ar, ar = RTL) + Tailwind, deployed on Vercel. MyFatoorah payments. Demos are **static HTML** in `public/demo/<id>/index.html` served via `vercel.json` rewrites (the `src/app/demo/[templateId]/route.ts` Handlebars renderer is a fallback). Auth uses **custom** `useSignUp`/`useSignIn` forms (not Clerk prebuilt). Builder data lives in Convex; a `localStorage["portfolio-draft"]` handoff already exists.

**Tech Stack:** next-intl, @clerk/nextjs (+ `/legacy` hooks), @clerk/localizations, qrcode, Handlebars templates, Playwright (verification via `scripts/*.mjs`, the repo's existing pattern — there is no unit-test harness, so "tests" = curl + Playwright scripts + manual checks).

---

## 📍 EXECUTION STATUS (live handoff — read this first)

**Last updated:** 2026-06-06 ~21:00 UTC. Executed via **subagent-driven-development** in the shared VPS master tree (`/home/trimind/trimind-portfolios`). All commits are **local only — NOT pushed** (don't push without owner OK; push = Vercel prod deploy). Base tree built green before starting.

**DONE & committed (this session):**
- ✅ Task 1.3 — Clerk localization + CAPTCHA language + green theme — `69ee402`
- ✅ Task 1.2 — in-app password reset flow (`/forgot-password`, `reset_password_email_code`) — `ca79fc6`
- ✅ Task 2.4 — Full Name field on sign-up + builder prefill — `1d6f729`
- ✅ Task 2.3 — Arabic template names/descriptions/professions on `/ar/templates` — `efd8acf`
- ✅ Task 1.4 scaffold — middleware skip + `vercel.json` rewrites for `/ar/demo/*` — `cdf6b07`
- ✅ Task 1.4 — Arabic **Engineer** demo `public/demo/engineer/index-ar.html` — `8bf4e0d`
- ✅ Task 1.4 — Arabic **General** demo `public/demo/corporate/index-ar.html` — `fcec579`
- ✅ Task 1.4 — Arabic **Creative** demo `public/demo/creative/index-ar.html` — `42af801`
  - NOTE: real creative demo persona is **Dalal Al-Kandari "My Eye Brain"** (46 artworks), NOT "Nora Al-Kandari". Translated the real content; route.ts DEMO_DATA differs from the live static file — expected.

**RESUME HERE (in order):**
1. **Task 1.4 — Arabic Developer demo** → create `public/demo/developer/index-ar.html` (persona **Yusuf Al-Hajri → يوسف الهاجري**, Full-Stack Developer → مطوّر متكامل). Same method as the others: `cp` then targeted Edits only (lang/dir, Noto Kufi font, hreflang, translate visible text, localize `/demo`+`/en` links to `/ar`, Arabic-Indic numerals, DO NOT touch 3D/WebGL JS). Commit `feat(demo): Arabic RTL Developer demo page`, stage ONLY the new file.
2. **Task 1.5** — Arabic Creator game `public/demo/creator/index-ar.html` (translate JS strings, keep mechanic/SVG/sound, RTL-audit, adapt the `scripts/creator-game-check.mjs` verify).
3. **Task 2.7** (Engineer projects EN+AR) → **2.1** (guest builder) → **2.8** (home form) → **2.2** (PDF/QR demos) → **2.5** (avatar) → **2.6** (resume btn) → **Part 3 polish** → **Part 5 verify**.

**Method reminders for the next operator:** fresh subagent per task (implementer → verify diff → next); for files that already carry other sessions' uncommitted changes, stage ONLY your own file via explicit `git add <path>` (never `git add -A`); verify each with `npx tsc --noEmit` (code) or `wc -l` parity + RTL/CJK node check (demos); don't push/deploy; don't run sustained-CPU watchers (VPS auto-reboots). Done/verify-only items: 1.1 (sign-up already fixed), 3.9 (auto-login), 3.12 (theme — folded into 1.3).

---

## ⚠️ Pre-flight (do once, before any task)

The shared working tree contains **uncommitted in-flight work from other sessions** that this plan builds ON TOP of (user-confirmed). Before starting:

- [ ] `cd /home/trimind/trimind-portfolios && git status --short` — confirm the in-flight files are still present (auth pages, `pricing/`, `templates/page.tsx`, demo HTML, `UseTemplateButton.tsx`, myfatoorah `webhook/`).
- [ ] `npm run build` — establish whether the current tree builds **before** you touch it. If it fails, fix the build first and report; do not stack new work on a red base.
- [ ] Per [[feedback_shared_working_tree]]: stage only files you change in each task's commit. Never `git add -A`.

## Status legend

Each task is tagged: **[DONE]** (already implemented in-flight — verify only) · **[PARTIAL]** (started; finish it) · **[TODO]** (net-new).

## Spec corrections (the QA prompt is partly stale — use these, not the prompt)

- Auth file paths are `src/app/[locale]/(app)/sign-in/[[...sign-in]]/page.tsx` and `…/sign-up/[[...sign-up]]/page.tsx` (NOT `app/(auth)/…`).
- Real demo personas (live `public/demo/*` + `route.ts` DEMO_DATA): General = **Sarah Al-Rashidi** (Sr Financial Analyst), Engineer = **Omar Al-Sabah** (Mechanical Engineer), Creative = **Nora Al-Kandari** (Visual Designer), Developer = **Yusuf Al-Hajri**, Creator = **Remi Vance** (the game). Keep these unless intentionally changing them; do NOT introduce the prompt's "Abdulrahman Alkandari"/"Dalal Al-Kandari" engineer/creative personas without the user's say-so.
- Demos are static files served by `vercel.json` rewrites → Arabic demos = mirror static files + add rewrites (matches the shipped creator pattern).
- `ADMIN_EMAILS` (`src/lib/admin.ts`): `trimindai@trimindai.com`, `90dalal@gmail.com`, `test@trimindai.com`, `w.baazm@gmail.com` — admins get free access + WIP-template preview.

---

## File Structure Map

**Auth** (`src/app/[locale]/(app)/`): `sign-in/[[...sign-in]]/page.tsx`, `sign-up/[[...sign-up]]/page.tsx`, `sign-in/layout.tsx`, `sign-up/layout.tsx`. Provider: `src/app/providers.tsx` (`<ClerkProvider>`). Gate: `src/middleware.ts`. New: `forgot-password/page.tsx`, `reset-password/page.tsx`.
**i18n:** `src/i18n/{routing,navigation,request}.ts`, `src/messages/{en,ar}.json`, locale shell `src/app/[locale]/layout.tsx` (sets `lang`/`dir`).
**Demos (live):** `public/demo/{corporate,engineer,creative,developer,creator}/index.html` + `vercel.json` rewrites. Fallback renderer: `src/app/demo/[templateId]/route.ts` + `src/lib/template-engine.ts` + `src/templates/<id>/template.hbs`.
**Templates data:** `src/lib/templates.ts`, `src/templates/<id>/manifest.json` (English-only strings), `src/lib/pricing.ts`, `src/lib/admin.ts`. Page: `src/app/[locale]/templates/page.tsx`.
**Builder:** `src/app/[locale]/(app)/dashboard/new/page.tsx`, `.../[id]/edit/page.tsx`, `.../[id]/preview/page.tsx`, `.../[id]/publish/page.tsx`, `src/components/builder/BuilderForm.tsx`.
**PDF/QR:** `src/lib/qr.ts` (`portfolioQrDataUrl`), `src/app/api/generate-cv/route.ts` (`renderCvPdf`), `src/templates/_cv/cv.hbs`.
**Homepage form:** `src/components/landing/TryItForm.tsx` (hardcodes `?template=corporate`), `src/app/[locale]/page.tsx`, `src/components/landing/UseTemplateButton.tsx`.

---

# PART 1 — Critical (launch blockers)

### Task 1.1: Sign-up flow — verify the in-flight fix **[DONE — verify only]**

The custom `useSignUp` form already fixes the `captcha_missing_token` silent-reset bug (visible `#clerk-captcha`, try/catch, `clerkError()` surfacing, email-code verify, `setActive` auto-sign-in, `redirect_url` preserved, RTL/AR copy).

**Files:** `src/app/[locale]/(app)/sign-up/[[...sign-up]]/page.tsx` (read-only here).

- [ ] **Step 1:** Live-verify with Playwright. Create `scripts/auth-signup-check.mjs` that navigates real Chrome to `https://portfolio-trimind.com/en/sign-up`, asserts the `#clerk-captcha` element is visible (height > 0), fills `testuser+<timestamp>@test.com` / `TestPass123!`, submits, and asserts the email-verify step renders (not a silent reset). (Use a disposable/aliased email; do not assert inbox delivery.)
- [ ] **Step 2:** Run it. Expected: reaches the "Verify your email" step with no console `captcha_missing_token`.
- [ ] **Step 3:** If it passes, no code change. Note result in the commit for Task 1.3 (they share the auth area). The Name field is added in **Task 2.4**.

---

### Task 1.2: In-app password reset flow **[TODO]**

Today the "Forgot password?" link hard-points to `https://accounts.portfolio-trimind.com/sign-in` (Clerk's hosted portal) — this is the "redirects to sign-in" behavior QA flagged. Build a real in-app reset using Clerk's `reset_password_email_code` strategy.

**Files:**
- Create: `src/app/[locale]/(app)/forgot-password/[[...forgot-password]]/page.tsx`
- Modify: `src/app/[locale]/(app)/sign-in/[[...sign-in]]/page.tsx` (repoint the link)
- (Optional) Create: `src/app/[locale]/(app)/forgot-password/layout.tsx` mirroring the sign-in layout.

- [ ] **Step 1:** Repoint the forgot link. In `sign-in/.../page.tsx`, replace the `<a href="https://accounts.portfolio-trimind.com/sign-in">` block with the i18n `Link`:

```tsx
import { Link } from "@/i18n/navigation";
// ...in the JSX where the forgot link is:
<div className="mt-4 text-center">
  <Link
    href="/forgot-password"
    className="text-xs text-[var(--land-muted)] hover:text-[var(--land-bright)]"
  >
    {t.forgot}
  </Link>
</div>
```

- [ ] **Step 2:** Create the reset page. Single page, two steps (request code → set new password), mirroring the sign-up page's structure, classes (`inputClass`, `primaryBtn`), and bilingual `t` object. Use `useSignIn` legacy hook:

```tsx
"use client";
import { Suspense, useState } from "react";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

function clerkError(err: unknown): string {
  const e = err as { errors?: Array<{ longMessage?: string; message?: string }> };
  return e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || "Something went wrong. Please try again.";
}

function ForgotForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const locale = ((useParams()?.locale as string) || "en");
  const isAr = locale === "ar";
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = isAr
    ? { title: "إعادة تعيين كلمة المرور", sub: "أدخل بريدك لإرسال رمز إعادة التعيين", email: "البريد الإلكتروني",
        send: "إرسال الرمز", sent: "تحقق من بريدك وأدخل الرمز وكلمة المرور الجديدة.", code: "رمز التحقق",
        newPass: "كلمة المرور الجديدة", confirm: "تأكيد كلمة المرور", reset: "تعيين كلمة المرور", working: "جارٍ المعالجة…",
        mismatch: "كلمتا المرور غير متطابقتين.", back: "العودة لتسجيل الدخول", done: "تم تحديث كلمة المرور بنجاح." }
    : { title: "Reset your password", sub: "Enter your email and we'll send a reset code", email: "Email address",
        send: "Send reset code", sent: "Check your email, then enter the code and your new password.", code: "Verification code",
        newPass: "New password", confirm: "Confirm password", reset: "Set new password", working: "Working…",
        mismatch: "Passwords don't match.", back: "Back to sign in", done: "Password updated successfully." };

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading) return;
    setError(null); setLoading(true);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
      setInfo(t.sent); setStep("reset");
    } catch (err) { setError(clerkError(err)); } finally { setLoading(false); }
  }

  async function doReset(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading) return;
    if (password !== confirm) { setError(t.mismatch); return; }
    setError(null); setLoading(true);
    try {
      const res = await signIn.attemptFirstFactor({ strategy: "reset_password_email_code", code, password });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        setInfo(t.done);
        setTimeout(() => window.location.assign(`/${locale}/dashboard`), 1500);
      } else { setError("Reset incomplete. Please retry."); }
    } catch (err) { setError(clerkError(err)); } finally { setLoading(false); }
  }
  // …render: card identical to sign-up; step "request" => email + send; step "reset" => code + newPass + confirm + reset.
  // Surface {error} (red alert) and {info} (muted) exactly like sign-up. Footer: <Link href="/sign-in">{t.back}</Link>.
}

export default function ForgotPasswordPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[var(--land-bg)]" />}><ForgotForm /></Suspense>;
}
```

- [ ] **Step 3:** Confirm `reset_password_email_code` is enabled in the Clerk dashboard (Email → "Forgot password" code). If only *link* strategy is on, switch the code above to `strategy: "reset_password_email_link"` and adjust. (Flag to user — dashboard access needed.)
- [ ] **Step 4:** Verify: `curl -o /dev/null -w "%{http_code}" https://<preview>/en/forgot-password` → 200; manual run of request→code→reset on the preview deploy.
- [ ] **Step 5:** Commit `forgot-password/**` + the sign-in link change. Message: `feat(auth): in-app password reset flow (email code)`.

---

### Task 1.3: CAPTCHA / Clerk localization — kill the Chinese text **[TODO]**

`<ClerkProvider>` in `src/app/providers.tsx` sets no `localization`, so Clerk's Turnstile widget guesses its language (renders Chinese for some GCC users). Wire Clerk localization to the next-intl locale.

**Files:** `src/app/providers.tsx`, `src/app/[locale]/layout.tsx` (passes `locale` into Providers if not already). Add dep `@clerk/localizations`.

- [ ] **Step 1:** `npm i @clerk/localizations`.
- [ ] **Step 2:** Thread `locale` into `Providers`. In `src/app/providers.tsx`:

```tsx
import { enUS, arSA } from "@clerk/localizations";
// add prop:
export function Providers({ children, locale = "en" }: { children: ReactNode; locale?: string }) {
  if (!convex) return <>{children}</>;
  return (
    <ClerkProvider
      localization={locale === "ar" ? arSA : enUS}
      signInUrl="/en/sign-in"
      signUpUrl="/en/sign-up"
      afterSignOutUrl="/en"
      appearance={{ variables: { colorPrimary: "#059669" } }}  // covers Task 3.12 theme
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>{children}</ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3:** In `src/app/[locale]/layout.tsx`, pass the resolved `locale` to `<Providers locale={locale}>`. (Read the file first — it may already render `<Providers>`.)
- [ ] **Step 4:** If Turnstile *still* shows non-locale text, the language is controlled in the **Clerk dashboard** (Bot protection → Turnstile widget). Flag to user; also try `appearance={{ captcha: { language: locale === "ar" ? "ar" : "en", theme: "dark" } }}`.
- [ ] **Step 5:** Verify with Playwright: load `/en/sign-up`, read the captcha iframe/text, assert no CJK characters present; load `/ar/sign-up`, assert Arabic or English (not Chinese).
- [ ] **Step 6:** Commit `providers.tsx` + `layout.tsx` + `package.json`. Message: `fix(auth): locale-aware Clerk localization + captcha language + green theme`.

---

### Task 1.4: Five Arabic RTL demo pages **[TODO — largest task]**

All `/ar/demo/{general,engineer,creative,creator,developer}` are 404. Live demos are static `public/demo/<id>/index.html`. Mirror each as an Arabic RTL file and add rewrites. **Decision:** static mirror (lowest risk, matches creator). Alternative (server-rendered locale-aware `route.ts`) is noted at the end but NOT chosen.

**Files per template:**
- Create: `public/demo/<id>/index-ar.html` (id ∈ corporate, engineer, creative, developer, creator)
- Modify: `vercel.json` (add 5 rewrites)
- Modify: each English `public/demo/<id>/index.html` to add an `hreflang` link to its `-ar` sibling.

> Note: `/demo/general` rewrites to `…/corporate/index.html`, so the General Arabic file is `public/demo/corporate/index-ar.html` and the rewrite is `/ar/demo/general → /demo/corporate/index-ar.html`.

Do this as **five independent sub-tasks** (one per template) so each is commit-and-shippable. Sub-task shape (repeat per id):

- [ ] **Step A:** `cp public/demo/<id>/index.html public/demo/<id>/index-ar.html`.
- [ ] **Step B:** In the new `-ar.html`: set `<html lang="ar" dir="rtl">`; ensure the Arabic webfont (Noto Kufi Arabic) is linked (copy the `<link>`/`@font-face` from `src/app/[locale]/layout.tsx` font setup or add Google Fonts); add `body{font-family:'Noto Kufi Arabic',sans-serif}`.
- [ ] **Step C:** Translate ALL visible copy to Arabic — nav, hero name/title/bio, every section heading, body, stats labels, footer, and the SAMPLE/CTA banners. Use the per-template Arabic content below. Use Arabic-Indic numerals (٠–٩) for stats where natural; keep Latin digits inside emails/URLs. Keep identical layout/colors. Point CTAs to `/ar/dashboard/new?template=<id>` (Arabic locale).
- [ ] **Step D:** Add `<link rel="alternate" hreflang="ar" href="https://portfolio-trimind.com/ar/demo/<slug>">` to the English file and `hreflang="en"` to the Arabic file (slug = general/engineer/creative/creator/developer).
- [ ] **Step E:** Add the rewrite to `vercel.json` `rewrites` (place BEFORE the catch-all none; order doesn't matter here since paths are exact):

```json
{ "source": "/ar/demo/general",   "destination": "/demo/corporate/index-ar.html" },
{ "source": "/ar/demo/engineer",  "destination": "/demo/engineer/index-ar.html" },
{ "source": "/ar/demo/creative",  "destination": "/demo/creative/index-ar.html" },
{ "source": "/ar/demo/developer", "destination": "/demo/developer/index-ar.html" },
{ "source": "/ar/demo/creator",   "destination": "/demo/creator/index-ar.html" }
```

- [ ] **Step F:** Verify on preview: `for s in general engineer creative creator developer; do curl -o /dev/null -w "%{http_code} /ar/demo/$s\n" https://<preview>/ar/demo/$s; done` → all 200. Playwright: assert `document.dir === "rtl"` and Arabic text present, 0 console errors, no horizontal overflow at 390px.
- [ ] **Step G:** Commit per template: `feat(demo): Arabic RTL <id> demo page`.

**Arabic content (personas match the live English demos):**

- **General → `corporate/index-ar.html`** — سارة الرشيدي · محللة مالية أولى · حاملة شهادة CFA | ١٢ سنة في القطاع المصرفي · مدينة الكويت، الكويت. نبذة: محللة مالية تعتمد على النتائج، متخصصة في إدارة المحافظ وتقييم المخاطر والتخطيط الاستثماري الاستراتيجي؛ قادت فرق تحليل تدير أصولاً تتجاوز ملياري دولار. إحصاءات: «+٢ مليار $ أصول حُلِّلت»، «١٢ سنة خبرة»، «٣٥٪ نمو المحفظة».
- **Engineer → `engineer/index-ar.html`** — عمر الصباح · مهندس ميكانيكي · النفط والغاز | تصميم العمليات | ٨ سنوات · مدينة الكويت، الكويت. نبذة: مهندس ميكانيكي متخصص في تصميم عمليات التكرير وتحسين أداء المصانع؛ خبرة في دراسات FEED وتطوير مخططات P&ID والتشغيل. أقسام: المشاريع → المشاريع، الخبرة → الخبرة، المهارات → المهارات.
- **Creative → `creative/index-ar.html`** — نورة الكندري · مصمّمة بصرية ومديرة فنية · الهوية البصرية | الفن الرقمي | تصميم المعارض · مدينة الكويت. نبذة: مصمّمة متعددة التخصصات تبتكر هويات بصرية للعلامات الفاخرة والمؤسسات الثقافية والشركات الناشئة في الشرق الأوسط.
- **Creator → `creator/index-ar.html`** — (the game; see Task 1.5 — heavier). Persona: عمر الصباح/«صانع المحتوى» per spec OR keep Remi Vance localized — **ask user**; default: localize copy, keep persona name transliterated.
- **Developer → `developer/index-ar.html`** — يوسف الهاجري · مطوّر متكامل · React | Node.js | معمارية السحابة · مدينة الكويت، الكويت. نبذة: يبني تطبيقات ويب قابلة للتوسّع وبنية سحابية للشركات الناشئة وعملاء المؤسسات.

> **Alternative (NOT chosen, document for future):** delete the static demos, move the route to `src/app/[locale]/demo/[templateId]/route.ts`, add `locale`+`isRTL` to `DEMO_DATA`, translate the hardcoded `.hbs` section labels via `messages/*.json`. Cleaner but high-risk against the polished static demos; revisit when consolidating.

---

### Task 1.5: Arabic Creator demo (the game) **[TODO]**

`public/demo/creator/index.html` is the hand-built "Portfolio Quest" game (English, `lang="en"`, persona Remi Vance). Produce an Arabic RTL playable version.

**Files:** Create `public/demo/creator/index-ar.html`; rewrite already added in Task 1.4-E.

- [ ] **Step 1:** Copy the file; set `lang="ar" dir="rtl"`; load Noto Kufi Arabic.
- [ ] **Step 2:** Translate every user-facing string in the inline JS (`I={}` label map, round titles "The Work/The Wins/The Trophies", score/combo/win/share copy, mute/skip/"Skip to the work", Contact). Keep the card-match mechanic, SVG art, sound, and `scripts/creator-game-check.mjs` invariants intact.
- [ ] **Step 3:** RTL-audit: card grid, popups, and score bar must mirror correctly; fix any `left/right` that should be `inset-inline`.
- [ ] **Step 4:** Adapt `scripts/creator-game-check.mjs` (or add `creator-game-check-ar.mjs`) to run the Arabic file: full playthrough in 390px Chrome, win reached, `overflowPx === 0`, 0 console errors, `document.dir==="rtl"`.
- [ ] **Step 5:** Verify `/ar/demo/creator` → 200 and the script passes. Commit: `feat(demo): Arabic RTL Creator game (Portfolio Quest)`.

---

# PART 2 — Major (conversion & UX)

### Task 2.1: Guest preview / builder without auth **[TODO]**

Builder is gated by `middleware.ts` (`/:locale/dashboard(.*)`). Allow guests to *build & preview* (localStorage), and only require auth at Publish/Download — restoring their draft after sign-up. A `localStorage["portfolio-draft"]` handoff and `dashboard/new` restore already exist; extend it to a full guest builder.

**Decision:** add a public route `src/app/[locale]/(app)/try/[templateId]/page.tsx` (or `build/[templateId]`) that renders `BuilderForm` in a guest mode persisting to `localStorage["portfolio_preview_data"]`, with a live preview and a persistent "Sign up free to publish" banner. On Publish/Download → route to `/sign-up?redirect_url=/<locale>/dashboard/new?fromGuest=1`; `dashboard/new` reads the guest blob and seeds the Convex portfolio.

**Files:**
- Create: `src/app/[locale]/(app)/try/[templateId]/page.tsx`
- Modify: `src/middleware.ts` (do NOT protect `/try`)
- Modify: `src/components/builder/BuilderForm.tsx` (accept `guest?: boolean`; when guest, persist to localStorage instead of Convex `updatePortfolio`, and swap the footer CTA)
- Modify: `src/app/[locale]/(app)/dashboard/new/page.tsx` (restore `portfolio_preview_data` like it already restores `portfolio-draft`)

- [ ] **Step 1:** Middleware — keep `isProtectedRoute` as is (it only matches `/dashboard` & `/admin`), and `/try` is naturally public. Confirm `/try` is not caught by `isStaticRoute` exclusions; intl middleware should run for it. Add a quick comment.
- [ ] **Step 2:** `BuilderForm` guest mode — add prop `guest?: boolean` and `onGuestPersist`. When `guest`, initialise state from `localStorage["portfolio_preview_data"]` and on every change `localStorage.setItem("portfolio_preview_data", JSON.stringify(formData))`; never call Convex mutations. Replace the save-on-nav with localStorage writes.
- [ ] **Step 3:** Guest page — render template chrome + `<BuilderForm guest templateId={…}/>` + persistent banner (bilingual: "Sign up free to publish your portfolio" / "سجّل مجانًا لنشر ملفك"). Publish/Download buttons → `useRouter().push('/' + locale + '/sign-up?redirect_url=' + encodeURIComponent('/' + locale + '/dashboard/new?fromGuest=1'))`.
- [ ] **Step 4:** `dashboard/new` restore — when `?fromGuest=1`, read `portfolio_preview_data`, pass into `api.portfolios.create`, then `localStorage.removeItem("portfolio_preview_data")`; show a "Your work is saved!" toast.
- [ ] **Step 5:** Point demo CTAs and homepage form at `/try/<id>` (ties into 2.8).
- [ ] **Step 6:** Verify (Playwright): visit `/en/try/general` unauthenticated → form usable, edits survive reload, "Publish" → sign-up with `redirect_url` containing `fromGuest=1`.
- [ ] **Step 7:** Commit. Message: `feat(builder): guest preview mode with localStorage draft + post-signup restore`.

---

### Task 2.2: Show working "Download CV PDF" + scannable QR on demos **[TODO]**

The product's differentiator (CV PDF with QR) is invisible on demos. The pieces exist: `portfolioQrDataUrl()` (`src/lib/qr.ts`), `renderCvPdf` + `/api/generate-cv`, QR cell in `src/templates/_cv/cv.hbs`.

**Decision:** since demos are static HTML, embed a **pre-generated** sample QR image + a "Download CV PDF" button that opens a pre-built sample PDF/printable page per template (no auth, no live API). Generate the sample assets at build/commit time with a script.

**Files:**
- Create: `scripts/build-demo-cv-assets.mjs` — for each demo persona, call the same render path to emit `public/demo/<id>/sample-cv.html` (printable) or `sample-cv.pdf`, and `public/demo/<id>/qr.png` (QR → `https://portfolio-trimind.com/demo/<slug>`), via `portfolioQrDataUrl`.
- Modify: each `public/demo/<id>/index.html` (+`-ar.html`) — add a visible "Download CV PDF" / «تحميل السيرة PDF» button (→ `sample-cv`) and a QR block labelled "Scan to view live portfolio" / «امسح للعرض المباشر».
- Modify (optional): `src/app/demo/[templateId]/route.ts` banners to include the same, for the fallback renderer.

- [ ] **Step 1:** Write `scripts/build-demo-cv-assets.mjs` reusing `renderCvPdf`/`portfolioQrDataUrl` with each demo's data. Output the QR PNG + a print-ready CV HTML per template.
- [ ] **Step 2:** Run it; confirm `public/demo/<id>/qr.png` scans (decode to the demo URL) and `sample-cv` renders with the QR in-page.
- [ ] **Step 3:** Add the button + QR block to each demo (EN + AR). Tooltip: "Your CV includes a QR code linking to your live portfolio." / «تحتوي سيرتك على رمز QR يربط بملفك المباشر».
- [ ] **Step 4:** General template "Save PDF" button must actually download — wire it to `sample-cv` (demo) and, in the real builder/preview, to `/api/generate-cv` (already wired there).
- [ ] **Step 5:** Verify: button downloads/opens a CV; QR decodes to the live URL (Playwright + a QR-decode lib, or manual scan).
- [ ] **Step 6:** Commit. Message: `feat(demo): visible Download-CV-PDF + scannable QR on all demos`.

---

### Task 2.3: Localize template names/descriptions on `/ar/templates` **[PARTIAL]**

`templates/page.tsx` is already i18n'd for labels (`t.available`, `t.preview`, `t.use`, admin-preview, price) — done in-flight. The GAP: `tpl.name`, `tpl.description`, `tpl.targetProfessions` come from **English-only** `manifest.json`, so they render in English on `/ar`.

**Decision:** add an Arabic translation map keyed by template id in the page (don't restructure manifests). The spec provides exact strings.

**Files:** `src/app/[locale]/templates/page.tsx` (and a small `src/lib/template-i18n.ts` if cleaner).

- [ ] **Step 1:** Add `const AR_TEMPLATE: Record<string,{name:string;description:string;targets:string[]}> = {...}` with the spec's Arabic strings (general/engineer/creative/creator/developer). E.g. general → `{ name:"عام", description:"ملف شخصي نظيف واحترافي يناسب أي مجال — الخيار المتعدد الاستخدامات...", targets:["محلل مالي","محاسب","مدقق حسابات"] }` (full set in QA spec §2.3).
- [ ] **Step 2:** In the card render, when `isAr`, use `AR_TEMPLATE[tpl.id]?.name ?? tpl.name` (same for description + targetProfessions); else the manifest values.
- [ ] **Step 3:** Also localize the page heading/subheading per spec: "اختر القالب المناسب" / "قوالب مخصصة حسب المهنة — اختر واحداً وانطلق في دقائق...".
- [ ] **Step 4:** Verify: `/ar/templates` shows all 5 cards with Arabic name/description/targets; `/en/templates` unchanged.
- [ ] **Step 5:** Commit. Message: `feat(i18n): Arabic template names/descriptions/professions on /ar/templates`.

---

### Task 2.4: "Full Name" field on sign-up **[TODO]**

Custom sign-up collects only email+password. Add Name as the first field, store in Clerk, prefill the builder.

**Files:** `src/app/[locale]/(app)/sign-up/[[...sign-up]]/page.tsx`; builder seed in `dashboard/new/page.tsx`.

- [ ] **Step 1:** Add state `const [name, setName] = useState("")` and a required "Full Name" / «الاسم الكامل» input as the FIRST field (placeholder "Your full name" / «الاسم الكامل»; min 2 chars; allow Arabic+Latin).
- [ ] **Step 2:** Pass it to Clerk in `handleStart`: `await signUp.create({ emailAddress: email, password, firstName: name.trim() });` (or split into first/last; Clerk requires name fields enabled in dashboard — flag to user). After `setActive`, also `await user.update({ unsafeMetadata: { fullName: name.trim() } })` is not available pre-session; instead store via `signUp.update({ unsafeMetadata })` or set it on first dashboard load.
- [ ] **Step 3:** On builder load (`dashboard/new`), seed `basics.fullName` from Clerk `user.fullName || unsafeMetadata.fullName` when the draft has none.
- [ ] **Step 4:** Verify: sign up with "Test User" → dashboard builder pre-fills the name.
- [ ] **Step 5:** Commit. Message: `feat(auth): full name on sign-up, prefilled into builder`.

---

### Task 2.5: Gradient initials avatar (replace gray silhouette) **[TODO]**

**Files:** the hero photo block in each `src/templates/<id>/template.hbs` (general first — exact `.hero-photo`/photo conditional location: read `src/templates/general/template.hbs`, search `photoUrl`), the demo static HTML heroes, and the builder/preview avatar.

- [ ] **Step 1:** Add a Handlebars partial/helper `initials(fullName)` → first letters of first two words (e.g. "Sarah Al-Rashidi" → "SA"; Arabic names → first letters too).
- [ ] **Step 2:** Replace the silhouette: `{{#if basics.photoUrl}}<img ... style="object-fit:cover">{{else}}<div class="avatar-initials" style="background:linear-gradient(135deg,var(--accent),...)">{{initials basics.fullName}}</div>{{/if}}` consistently across templates. Add a subtle hover camera icon to hint upload (builder only).
- [ ] **Step 3:** Mirror in the static demos (general/engineer/creative/developer/creator EN+AR) using the persona initials.
- [ ] **Step 4:** Verify visually across all templates (Playwright screenshots).
- [ ] **Step 5:** Commit. Message: `feat(templates): gradient initials avatar fallback across templates`.

---

### Task 2.6: Engineer "Resume" button handler **[TODO]**

**Files:** `src/templates/engineer/template.hbs` (and `public/demo/engineer/index.html` + `-ar`).

- [ ] **Step 1:** Give the resume/credentials section `id="resume"`. Make the hero "Resume" button `<a href="#resume">` with `scroll-behavior:smooth` on the container (or a tiny inline `onclick` smooth-scroll).
- [ ] **Step 2:** Verify: clicking "Resume" smoothly scrolls to the section (Playwright: assert scroll position changes / element in view).
- [ ] **Step 3:** Commit. Message: `fix(engineer): Resume button scrolls to resume section`.

---

### Task 2.7: Engineer projects listing page **[TODO]**

`/demo/engineer/projects` 404s; creative already has `…/projects/:slug` static pages (per `vercel.json`). Mirror that for engineer.

**Files:** Create `public/demo/engineer/projects/index.html` (+ `-ar`), and per-project `…/projects/<slug>/index.html` if linking to detail; add `vercel.json` rewrites; point the Engineer nav "Projects" link at it.

- [ ] **Step 1:** Build a grid of project cards (image, title, year, blurb) from the engineer demo's projects (Clean Fuel Project, Gas Compression Station Upgrade — add ≥1 more per Task 3.6 to reach 3). Breadcrumb: Home → Projects → {name}.
- [ ] **Step 2:** Add rewrites: `/demo/engineer/projects` → `…/projects/index.html`, `/demo/engineer/projects/:slug` → `…/projects/:slug/index.html`, plus `/ar/demo/engineer/projects*` → `-ar` variants.
- [ ] **Step 3:** Point the Engineer nav "Projects" link to `/demo/engineer/projects`.
- [ ] **Step 4:** Verify: `/demo/engineer/projects` and `/ar/demo/engineer/projects` → 200, cards render, nav link works.
- [ ] **Step 5:** Commit. Message: `feat(demo): Engineer projects listing (EN+AR)`.

---

### Task 2.8: Homepage mini-form respects template choice **[TODO]**

`src/components/landing/TryItForm.tsx` hardcodes `?template=corporate`.

**Decision (spec Option A, preferred):** after submit, route to `/templates` (or `/try`) with name/title prefilled so the user picks a template, instead of forcing general.

**Files:** `src/components/landing/TryItForm.tsx`, `src/app/[locale]/templates/page.tsx` (read prefilled draft), and/or the guest `/try` route from 2.1.

- [ ] **Step 1:** Keep the `localStorage.setItem("portfolio-draft", …)` write. Change the redirect from `/${locale}/dashboard/new?template=corporate` to `/${locale}/templates?prefill=1` (so user chooses) — OR, if a template selector is added, `/${locale}/try/${selected}`.
- [ ] **Step 2 (if selector):** add an "I am a…" radio group (General / Engineer / Creative / Creator) and route to the matching `/try/<id>`.
- [ ] **Step 3:** Verify: submitting the homepage form lands on template choice (not a forced general build) and the name/title persist.
- [ ] **Step 4:** Commit. Message: `fix(home): quick-start form lets user pick template instead of forcing general`.

---

# PART 3 — Minor polish

Batch these; each is small. Verify visually, commit in small groups.

- [ ] **3.1** Stronger nav hover (underline/color shift) — demo HTML + template `.hbs` nav styles.
- [ ] **3.2** Certification badges clickable → expand details — `src/templates/general/template.hbs` credentials section + demo.
- [ ] **3.3** Reviewer photo avatars on testimonials (use initials avatar from 2.5) — general endorsements (`template.hbs` ~1424-1447) + `src/components/landing/Testimonials.tsx`.
- [ ] **3.4** Footer "Built with…" link `target="_blank"` — **[PARTIAL]** already present in `general/template.hbs:1509`; apply to engineer/creative/developer/creator + demos.
- [ ] **3.5** Phone numbers `tel:` links — **[PARTIAL]** done in `general/template.hbs:1465` & `_cv/cv.hbs`; apply to other templates + demos.
- [ ] **3.6** ≥3 demo projects on Engineer — extend `DEMO_DATA.engineer.projects` in `route.ts` AND the static `public/demo/engineer/index.html`.
- [ ] **3.7** Show/hide password toggle — sign-in + sign-up pages (add an eye button toggling `type` between `password`/`text`).
- [ ] **3.8** "Remember me" — **[N/A/SKIP]** Clerk sessions persist by default; the sign-in already has brute-force lockout. Add a checkbox only if the user wants it (cosmetic). Flag, default skip.
- [ ] **3.9** Auto-login after sign-up — **[DONE]** `setActive` + `window.location.assign` already does this (verify only).
- [ ] **3.10** Footer copyright em-dash "—" consistency — all footers (templates + demos + landing footer).
- [ ] **3.11** LinkedIn link on Engineer demo — add to `DEMO_DATA.engineer.basics` + static demo.
- [ ] **3.12** Clerk auth theme = site green — **[DONE in Task 1.3]** via `appearance.variables.colorPrimary` (custom forms already match; verify the captcha/widget chrome).
- [ ] **3.13** Translate page titles on `/ar/*` inner pages — audit `generateMetadata`/`<title>` per `[locale]` route; ensure Arabic titles (some done in commit `92630af` SEO/i18n — verify).
- [ ] **3.14** Arabic email placeholder on `/ar` auth — sign-in/sign-up already RTL; placeholders are `you@example.com` (keep Latin email; translate the label only — already done). Verify, likely no-op.
- [ ] **3.15** "Portfolio Pro" → «بورتفوليو برو» in Arabic nav/logo — find the nav/logo component (`src/components/landing/*` header) and localize the brand string when `isAr`.

Commit polish in themed groups: `style(polish): nav hover, footers, tel links, brand localization`, etc.

---

# PART 4 — Enhancements (backlog, post-launch — NOT this milestone)

Track as backlog, do not implement now unless the user asks: inline achievement-writing tooltips (bilingual), drag-drop section reordering, dark-mode toggle, scroll fade-ins, back-to-top button, LinkedIn import, video gallery for Creative, ATS-friendly PDF audit, before/after CV comparison on homepage, social proof (user count/logos). Create `docs/superpowers/specs/` entries when picked up.

---

# PART 5 — Acceptance verification (run after each Part)

Translate the QA checklist into runnable checks. Prefer a single Playwright script `scripts/portfolio-fix-verify.mjs` covering:

**Auth:** signup(new)→verify step; signup(dup)→clear error; signin(good)→dashboard; signin(bad)→"Invalid email or password"; `/forgot-password` 200 + request→reset; captcha shows no CJK on `/en` and `/ar`.
**Arabic demos:** all 5 `/ar/demo/*` → 200, `dir==="rtl"`, Arabic text, nav links work, 0 console errors, no 390px overflow.
**Templates:** `/ar/templates` → 5 cards, Arabic name/description/targets/buttons.
**Builder:** guest can build at `/try/*`, edits survive reload, Publish→sign-up w/ `redirect_url`, post-signup restore.
**PDF+QR:** Download button present+working on all demos; QR decodes to live URL.
**Engineer:** Resume scrolls; `/demo/engineer/projects` 200 w/ cards.
**Polish:** initials avatar; tel: links; footer `_blank`; password show/hide; nav hover.

- [ ] Run `node scripts/portfolio-fix-verify.mjs` against the preview deploy; all green before promoting to production.

---

# PART 6 — Test fixtures

Signup: `Test User` / `testuser+<ts>@test.com` / `TestPass123!`. Builders: Ahmad Al-Farsi (Sr Financial Analyst, Kuwait, +965 5555 1234); Eng. Fatima Al-Hassan (Electrical Engineer, Dubai, +971 50 123 4567); Dalal Al-Kandari (Visual Artist, Kuwait); Omar Al-Sabah (Content Creator, Riyadh).

---

## Recommended execution order

1. **1.3** (captcha localization — quick, unblocks GCC signups) → **1.2** (reset) → **2.4** (name) — finish the auth surface together, one commit area.
2. **2.3** (Arabic templates text — small, high visibility).
3. **1.4** (5 Arabic demos) → **1.5** (Arabic creator) → **2.7** (engineer projects) — the content-heavy block.
4. **2.1** (guest builder) → **2.8** (home form) → **2.2** (PDF/QR demos) — conversion block.
5. **2.5, 2.6** then **Part 3** polish.
6. Run **Part 5** after each block; promote when green.

Each numbered task is independently shippable — commit and (optionally) deploy a preview between tasks. Do NOT batch-then-test (QA spec reminder #1).

---

## Self-Review (completed by author)

- **Spec coverage:** every QA item 1.1–3.15 maps to a task above; Part 4 items are explicitly deferred. Items already implemented in-flight are marked DONE/PARTIAL with verify-only steps (1.1, 3.9, 3.12, partials 2.3/3.4/3.5/3.13/3.14).
- **Placeholder scan:** large net-new tasks (1.4, 1.5, 2.1, 2.2) give concrete file paths + real symbols (`renderCvPdf`, `portfolioQrDataUrl`, `useSignIn` `reset_password_email_code`, `isProtectedRoute`, `localStorage` keys) and key code; remaining per-string content is supplied (Arabic copy) or pulled verbatim from QA spec §2.3. No "TODO/handle errors" placeholders.
- **Type/symbol consistency:** auth uses `@clerk/nextjs/legacy` `useSignUp`/`useSignIn` (matches existing pages); demos use static-file + `vercel.json` rewrite pattern (matches creator); localStorage keys: existing `portfolio-draft` (home→builder) vs new `portfolio_preview_data` (guest builder) — intentionally distinct, noted.
- **Open items needing user/dashboard input (flagged in tasks):** Clerk dashboard toggles for password-reset-code strategy (1.2) and name fields (2.4); Turnstile widget language if localization alone doesn't fix it (1.3); Creator Arabic persona choice (1.4/1.5); "Remember me" necessity (3.8).
