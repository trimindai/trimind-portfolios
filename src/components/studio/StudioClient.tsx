"use client";

// CV Studio — the conversational, two-pane portfolio builder. THE single builder.
//   LEFT : upload / paste a CV (create) OR straight to controls (edit) → quick
//          controls + chat refine.
//   RIGHT: live preview (portfolio web view ↔ CV PDF w/ QR), watermarked until paid.
//   BOTTOM: pay (existing MyFatoorah flow) + publish + download → the existing
//           /dashboard/[id]/publish page (no flow duplicated here).
//
// One component drives both entry points:
//   /build         → create (no initialId; upload/paste → AI auto-build)
//   /build/[id]    → edit   (initialId set; skips upload, loads that portfolio)

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Link, useRouter } from "@/i18n/navigation";
import PreviewFrame from "@/components/preview/PreviewFrame";
import { toPortfolioData } from "@/lib/portfolio-data";
import { pickPrimaryPortfolio } from "@/lib/single-cv";
import { COLOR_PRESETS, type TemplatePresetKey } from "@/lib/color-presets";
import { resolveTemplateId, TEMPLATES } from "@/lib/templates";
import {
  Upload,
  Loader2,
  Send,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  FileText,
  Globe,
  ArrowLeft,
} from "lucide-react";

const HEADING_FONTS = [
  "Inter",
  "Playfair Display",
  "DM Sans",
  "Raleway",
  "Merriweather",
  "Lora",
  "Source Sans 3",
  "Space Grotesk",
  "Cormorant Garamond",
];
const BODY_FONTS = ["Inter", "DM Sans", "Source Sans 3", "Raleway", "Lora"];

// Custom colour picker fields → customization keys (live preview reads these).
const COLOR_FIELDS = [
  { key: "primaryColor", state: "primary", en: "Primary", ar: "الأساسي", fallback: "#000000" },
  { key: "accentColor", state: "accent", en: "Accent", ar: "التمييز", fallback: "#059669" },
  { key: "bgColor", state: "bg", en: "Background", ar: "الخلفية", fallback: "#ffffff" },
] as const;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

type Sec = { id: string; en: string; ar: string };

// Section ids MUST match each template's `{{#unless (isHidden "id")}}` guards
// (see src/templates/<id>/template.hbs) so a toggle actually hides something.
const GENERAL_SECTIONS: Sec[] = [
  { id: "value-proposition", en: "Value proposition", ar: "القيمة المهنية" },
  { id: "career", en: "Experience", ar: "الخبرة" },
  { id: "impact", en: "Impact stories", ar: "الإنجازات" },
  { id: "competencies", en: "Skills", ar: "المهارات" },
  { id: "education", en: "Education", ar: "التعليم" },
  { id: "credentials", en: "Credentials", ar: "الشهادات" },
  { id: "professional-profile", en: "Professional profile", ar: "الملف المهني" },
  { id: "endorsements", en: "Endorsements", ar: "التزكيات" },
];
const ENGINEER_SECTIONS: Sec[] = [
  { id: "experience", en: "Experience", ar: "الخبرة" },
  { id: "projects", en: "Projects", ar: "المشاريع" },
  { id: "skills", en: "Skills", ar: "المهارات" },
  { id: "education", en: "Education", ar: "التعليم" },
  { id: "certifications", en: "Certifications", ar: "الشهادات" },
  { id: "languages", en: "Languages", ar: "اللغات" },
  { id: "endorsements", en: "Endorsements", ar: "التزكيات" },
];
const CREATIVE_SECTIONS: Sec[] = [
  { id: "experience", en: "Experience", ar: "الخبرة" },
  { id: "skills", en: "Skills", ar: "المهارات" },
  { id: "awards", en: "Awards", ar: "الجوائز" },
  { id: "testimonials", en: "Testimonials", ar: "آراء" },
];
const CREATOR_SECTIONS: Sec[] = [
  { id: "content-showcase", en: "Content showcase", ar: "أعمالي" },
  { id: "social-stats", en: "Social stats", ar: "إحصاءات" },
  { id: "experience", en: "Experience", ar: "الخبرة" },
  { id: "skills", en: "Skills", ar: "المهارات" },
  { id: "education", en: "Education", ar: "التعليم" },
  { id: "certifications", en: "Certifications", ar: "الشهادات" },
  { id: "endorsements", en: "Endorsements", ar: "التزكيات" },
  { id: "languages", en: "Languages", ar: "اللغات" },
];
const DEVELOPER_SECTIONS: Sec[] = [
  { id: "experience", en: "Experience", ar: "الخبرة" },
  { id: "projects", en: "Projects", ar: "المشاريع" },
  { id: "skills", en: "Skills", ar: "المهارات" },
];
const SECTIONS_BY_TEMPLATE: Record<string, Sec[]> = {
  general: GENERAL_SECTIONS,
  engineer: ENGINEER_SECTIONS,
  creative: CREATIVE_SECTIONS,
  creator: CREATOR_SECTIONS,
  developer: DEVELOPER_SECTIONS,
};

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function StudioClient({ initialId }: { initialId?: string }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = ((params.locale as string) === "ar" ? "ar" : "en") as "en" | "ar";
  const isRTL = locale === "ar";
  const T = (en: string, ar: string) => (isRTL ? ar : en);

  // /build/[id] passes initialId (edit mode); /build resumes a draft via ?id=.
  const [portfolioId, setPortfolioId] = useState<string | null>(
    initialId ?? searchParams.get("id")
  );
  const [view, setView] = useState<"live" | "cv">("live");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [uploading, setUploading] = useState(false);
  const [parseError, setParseError] = useState("");
  const [pasteText, setPasteText] = useState("");
  // Plain-English notes merged into the uploaded/pasted CV in a single parse.
  const [instructions, setInstructions] = useState("");
  // Hex text fields for the custom colour picker (synced from saved colours).
  const [hexInputs, setHexInputs] = useState({ primary: "", accent: "", bg: "" });
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Wait for Clerk's token to attach to Convex before querying — on a cold
  // /build/[id] load the id is set synchronously, so an ungated query fires
  // before auth is ready and portfolios.get (requireAdminOrOwner) throws.
  const { isAuthenticated } = useConvexAuth();
  const portfolio = useQuery(
    api.portfolios.get,
    portfolioId && isAuthenticated ? { id: portfolioId as Id<"portfolios"> } : "skip"
  );
  const update = useMutation(api.portfolios.update);
  const router = useRouter();

  // One CV per user: in CREATE mode, if the signed-in user already has a
  // portfolio, open it instead of starting a new one. Skipped in edit mode and
  // when resuming a draft via ?id. Paid/published always wins (never strand a
  // paying user); otherwise newest. Hidden extras are never deleted.
  const myList = useQuery(
    api.portfolios.listByUser,
    isAuthenticated && !initialId && !portfolioId ? {} : "skip"
  );
  const checkingExisting =
    !initialId && !portfolioId && isAuthenticated && myList === undefined;
  useEffect(() => {
    if (initialId || portfolioId || !myList || myList.length === 0) return;
    const primary = pickPrimaryPortfolio(myList);
    if (primary) router.replace(`/build/${primary._id}`);
  }, [myList, initialId, portfolioId, router]);

  const previewData = useMemo(
    () => (portfolio ? toPortfolioData(portfolio, locale) : null),
    [portfolio, locale]
  );

  const templateKey = (resolveTemplateId(portfolio?.templateId) ||
    "general") as TemplatePresetKey;
  const presets = COLOR_PRESETS[templateKey] || COLOR_PRESETS.general;
  const sections = SECTIONS_BY_TEMPLATE[templateKey] || GENERAL_SECTIONS;
  const cust: any = portfolio?.customization || {};
  const hidden: string[] = cust.hiddenSections || [];
  const paid =
    portfolio?.status === "paid" || portfolio?.status === "published";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Mirror saved colours into the hex text fields (so a preset click or chat
  // colour change updates them too). Typing an invalid partial hex doesn't
  // patch, so cust is unchanged and this won't clobber what's being typed.
  useEffect(() => {
    setHexInputs({
      primary: cust.primaryColor || "",
      accent: cust.accentColor || "",
      bg: cust.bgColor || "",
    });
  }, [cust.primaryColor, cust.accentColor, cust.bgColor]);

  // Edit mode: greet once the loaded portfolio arrives (no upload step).
  useEffect(() => {
    if (initialId && portfolio && chat.length === 0) {
      setChat([
        {
          role: "assistant",
          content: T(
            "Loaded your portfolio ✨ Tell me what to change — colours, fonts, which sections to show, or ask me to rewrite your summary.",
            "حمّلت بورتفوليوك ✨ قل لي وش أغيّر — الألوان، الخطوط، الأقسام، أو خلّني أعيد صياغة نبذتك."
          ),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId, portfolio]);

  // Create mode: seed the paste box from the landing hero (name + title saved
  // to localStorage by TryItForm) so the user's details carry over instead of
  // facing a blank screen. Consume it once.
  useEffect(() => {
    if (initialId || portfolioId) return;
    try {
      const raw = localStorage.getItem("portfolio-draft");
      if (!raw) return;
      const { fullName, title } = JSON.parse(raw);
      const seed = [fullName, title].filter(Boolean).join("\n");
      if (seed) setPasteText((prev) => prev || seed);
      localStorage.removeItem("portfolio-draft");
    } catch {
      /* ignore malformed draft */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── parse a CV (file or pasted text) ───────────────────────────────────────
  const onParsed = useCallback(
    (id: string) => {
      setPortfolioId(id);
      // keep the id in the URL so a refresh resumes the same draft
      const url = new URL(window.location.href);
      url.searchParams.set("id", id);
      window.history.replaceState(null, "", url.toString());
      setChat([
        {
          role: "assistant",
          content: T(
            "Your portfolio is ready on the right ✨ Tell me what to change — colours, fonts, which sections to show, or ask me to rewrite your summary.",
            "بورتفوليو جاهز على اليمين ✨ قل لي وش أغيّر — الألوان، الخطوط، الأقسام، أو خلّني أعيد صياغة نبذتك."
          ),
        },
      ]);
    },
    [isRTL]
  );

  async function handleFile(file: File) {
    setUploading(true);
    setParseError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("locale", locale);
      if (instructions.trim()) fd.append("instructions", instructions.trim());
      const res = await fetch("/api/parse-cv", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      onParsed(data.portfolioId);
    } catch (e: any) {
      setParseError(e?.message || T("Couldn't read that CV.", "تعذّرت قراءة السيرة."));
    } finally {
      setUploading(false);
    }
  }

  async function handlePaste() {
    if (pasteText.trim().length < 20) {
      setParseError(T("Paste a bit more of your CV.", "الصق نصًّا أطول من سيرتك."));
      return;
    }
    setUploading(true);
    setParseError("");
    try {
      const res = await fetch("/api/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: pasteText,
          locale,
          ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      onParsed(data.portfolioId);
    } catch (e: any) {
      setParseError(e?.message || T("Couldn't parse that.", "تعذّر التحليل."));
    } finally {
      setUploading(false);
    }
  }

  // ── quick controls (write straight to Convex; preview re-renders reactively) ─
  function patchCustomization(partial: Record<string, unknown>) {
    if (!portfolioId) return;
    update({
      id: portfolioId as Id<"portfolios">,
      customization: { ...cust, ...partial },
    }).catch(() => {});
  }
  function toggleSection(id: string) {
    const next = hidden.includes(id)
      ? hidden.filter((s) => s !== id)
      : [...hidden, id];
    patchCustomization({ hiddenSections: next });
  }
  // Switch template: top-level field (not customization). Preview, colour
  // presets and section toggles all re-derive off portfolio.templateId.
  function setTemplate(id: string) {
    if (!portfolioId || id === templateKey) return;
    update({ id: portfolioId as Id<"portfolios">, templateId: id }).catch(() => {});
  }

  // ── chat ────────────────────────────────────────────────────────────────────
  async function sendChat() {
    const msg = chatInput.trim();
    if (!msg || !portfolioId || sending) return;
    setChatInput("");
    setChat((c) => [...c, { role: "user", content: msg }]);
    setSending(true);
    try {
      const res = await fetch("/api/cv-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolioId,
          message: msg,
          history: chat.slice(-10),
        }),
      });
      const data = await res.json();
      setChat((c) => [
        ...c,
        {
          role: "assistant",
          content: res.ok
            ? data.reply
            : data.error || T("Something went wrong.", "صار خطأ."),
        },
      ]);
    } catch {
      setChat((c) => [
        ...c,
        { role: "assistant", content: T("Network error.", "خطأ في الشبكة.") },
      ]);
    } finally {
      setSending(false);
    }
  }

  // ── render ──────────────────────────────────────────────────────────────────
  const hasPortfolio = !!portfolioId && portfolio !== null;
  const loadingDoc = !!portfolioId && portfolio === undefined;

  return (
    <div className="flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      {/* top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--land-border)] pb-3 mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--land-body)] hover:text-[var(--land-bright)]"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {T("Dashboard", "لوحة التحكم")}
        </Link>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--land-bright)]">
          <Sparkles className="h-4 w-4 text-[var(--land-accent)]" />
          {T("CV Studio", "استوديو السيرة")}
        </div>
        {hasPortfolio ? (
          <Link
            href={`/dashboard/${portfolioId}/publish`}
            className="rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
          >
            {paid
              ? T("Download / Publish", "نشر / تحميل")
              : T("✅ Publish & download", "✅ نشر وتحميل")}
          </Link>
        ) : (
          <span className="w-24" />
        )}
      </div>

      {/* ── no portfolio yet: upload / paste ───────────────────────────────── */}
      {!hasPortfolio && (
        <div className="mx-auto w-full max-w-xl py-10">
          {loadingDoc || checkingExisting ? (
            <div className="flex flex-col items-center py-20 text-[var(--land-body)]">
              <Loader2 className="mb-3 h-7 w-7 animate-spin text-[var(--land-accent)]" />
              {T("Loading your draft…", "جارٍ تحميل المسودة…")}
            </div>
          ) : (
            <>
              <h1 className="text-center text-2xl font-bold text-[var(--land-bright)]">
                {T("Build your portfolio with AI", "ابنِ بورتفوليو بالذكاء الاصطناعي")}
              </h1>
              <p className="mt-2 text-center text-[var(--land-body)]">
                {T(
                  "Upload your CV (PDF, Word, or a photo) or paste it — the AI builds your full portfolio, then you refine it by chat.",
                  "ارفع سيرتك (PDF أو Word أو صورة) أو الصقها — الذكاء الاصطناعي يبني البورتفوليو كاملًا، ثم تحسّنه بالمحادثة."
                )}
              </p>

              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--land-border)] bg-[var(--land-surface)]/40 px-6 py-12 text-center transition-colors hover:border-[var(--land-accent)]"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--land-accent)]" />
                ) : (
                  <Upload className="h-8 w-8 text-[var(--land-accent)]" />
                )}
                <span className="mt-3 font-medium text-[var(--land-bright)]">
                  {uploading
                    ? T("Reading your CV…", "جارٍ قراءة سيرتك…")
                    : T("Drop your CV or click to upload", "أفلت سيرتك أو اضغط للرفع")}
                </span>
                <span className="mt-1 text-xs text-[var(--land-muted)]">
                  PDF · Word · TXT · JPG/PNG · ≤ 8 MB
                </span>
              </label>

              {/* Optional plain-English notes merged into the CV in one parse. */}
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-[var(--land-bright)]">
                  {T("Anything to add or change? (optional)", "تبي تضيف أو تعدّل شي؟ (اختياري)")}
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  disabled={uploading}
                  rows={3}
                  maxLength={4000}
                  placeholder={T(
                    "e.g. add my new role at Acme (2024–now), emphasise leadership, fix my job title…",
                    "مثال: أضف وظيفتي الجديدة في أكمي (٢٠٢٤–الآن)، ركّز على القيادة، صحّح مسماي الوظيفي…"
                  )}
                  className="w-full rounded-xl border border-[var(--land-border)] bg-[var(--land-bg)] p-3 text-sm text-[var(--land-bright)] outline-none focus:border-[var(--land-accent)]"
                />
                <p className="mt-1 text-xs text-[var(--land-muted)]">
                  {T(
                    "We'll merge these notes with your uploaded or pasted CV.",
                    "بندمج هذي الملاحظات مع سيرتك المرفوعة أو الملصوقة."
                  )}
                </p>
              </div>

              <div className="my-6 flex items-center gap-3 text-xs text-[var(--land-muted)]">
                <span className="h-px flex-1 bg-[var(--land-border)]" />
                {T("or paste it", "أو الصقها")}
                <span className="h-px flex-1 bg-[var(--land-border)]" />
              </div>

              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                disabled={uploading}
                rows={6}
                placeholder={T(
                  "Paste your CV text, or just write your name, title, experience, skills…",
                  "الصق نص سيرتك، أو اكتب اسمك ومسماك وخبرتك ومهاراتك…"
                )}
                className="w-full rounded-xl border border-[var(--land-border)] bg-[var(--land-bg)] p-3 text-sm text-[var(--land-bright)] outline-none focus:border-[var(--land-accent)]"
              />
              <button
                onClick={handlePaste}
                disabled={uploading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--land-accent)] py-3 font-semibold text-white hover:bg-[var(--land-accent-hover)] disabled:opacity-60 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {T("Build my portfolio", "ابنِ بورتفوليو")}
              </button>

              {parseError && (
                <p className="mt-3 text-center text-sm text-red-500">{parseError}</p>
              )}
            </>
          )}
        </div>
      )}

      {/* ── two-pane studio ─────────────────────────────────────────────────── */}
      {hasPortfolio && previewData && (
        <div className="grid gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]">
          {/* LEFT: controls + chat */}
          <div className="flex flex-col gap-5">
            {/* design / template — try all 5 live, pick the best */}
            <section className="rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)]/40 p-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--land-bright)]">
                {T("Design", "التصميم")}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((t) => {
                  const active = t.id === templateKey;
                  return (
                    <button
                      key={t.id}
                      title={t.description}
                      onClick={() => setTemplate(t.id)}
                      // ponytail: manifest names are English-only; fine as short labels
                      className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                        active
                          ? "border-[var(--land-accent)] bg-[var(--land-accent-subtle)] text-[var(--land-accent-hover)]"
                          : "border-[var(--land-border)] text-[var(--land-body)] hover:border-[var(--land-accent)]"
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* colours */}
            <section className="rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)]/40 p-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--land-bright)]">
                {T("Colours", "الألوان")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    title={p.name}
                    onClick={() =>
                      patchCustomization({
                        ...(p.primary ? { primaryColor: p.primary } : {}),
                        accentColor: p.accent,
                        bgColor: p.bg,
                      })
                    }
                    className="h-9 w-9 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${
                        p.primary || p.accent
                      } 0 50%, ${p.accent} 50% 100%)`,
                    }}
                  />
                ))}
              </div>

              {/* Custom — any hex; persists via the same path as presets, so the
                  preview updates live. ponytail: color input patches on every
                  change; debounce only if write volume ever matters. */}
              <div className="mt-4 border-t border-[var(--land-border)] pt-3">
                <p className="mb-2 text-xs font-medium text-[var(--land-muted)]">
                  {T("Custom", "مخصص")}
                </p>
                <div className="space-y-2">
                  {COLOR_FIELDS.map((f) => {
                    const saved = (cust[f.key] as string) || "";
                    const swatch = HEX_RE.test(saved) ? saved : f.fallback;
                    return (
                      <div key={f.key} className="flex items-center gap-2">
                        <span className="w-24 text-xs text-[var(--land-body)]">
                          {T(f.en, f.ar)}
                        </span>
                        <input
                          type="color"
                          value={swatch}
                          onChange={(e) => patchCustomization({ [f.key]: e.target.value })}
                          aria-label={T(f.en, f.ar)}
                          className="h-8 w-10 cursor-pointer rounded border border-[var(--land-border)] bg-transparent p-0"
                        />
                        <input
                          type="text"
                          dir="ltr"
                          value={hexInputs[f.state]}
                          onChange={(e) => {
                            const v = e.target.value;
                            setHexInputs((h) => ({ ...h, [f.state]: v }));
                            if (HEX_RE.test(v)) patchCustomization({ [f.key]: v });
                          }}
                          placeholder={f.fallback}
                          maxLength={7}
                          className="w-24 rounded-lg border border-[var(--land-border)] bg-[var(--land-bg)] px-2 py-1 text-xs text-[var(--land-bright)] outline-none focus:border-[var(--land-accent)]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* fonts */}
            <section className="rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)]/40 p-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--land-bright)]">
                {T("Fonts", "الخطوط")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-[var(--land-body)]">
                  {T("Headings", "العناوين")}
                  <select
                    value={cust.fontFamily || "Inter"}
                    onChange={(e) => patchCustomization({ fontFamily: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[var(--land-border)] bg-[var(--land-bg)] p-2 text-sm text-[var(--land-bright)]"
                  >
                    {HEADING_FONTS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-[var(--land-body)]">
                  {T("Body", "النص")}
                  <select
                    value={cust.bodyFont || "Inter"}
                    onChange={(e) => patchCustomization({ bodyFont: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[var(--land-border)] bg-[var(--land-bg)] p-2 text-sm text-[var(--land-bright)]"
                  >
                    {BODY_FONTS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            {/* sections */}
            <section className="rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)]/40 p-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--land-bright)]">
                {T("Sections", "الأقسام")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {sections.map((s) => {
                  const on = !hidden.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSection(s.id)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        on
                          ? "border-[var(--land-accent)] bg-[var(--land-accent-subtle)] text-[var(--land-accent-hover)]"
                          : "border-[var(--land-border)] text-[var(--land-muted)] line-through"
                      }`}
                    >
                      {isRTL ? s.ar : s.en}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* chat */}
            <section className="flex min-h-[320px] flex-1 flex-col rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)]/40 p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--land-bright)]">
                <Sparkles className="h-4 w-4 text-[var(--land-accent)]" />
                {T("Refine by chat", "حسّن بالمحادثة")}
              </h3>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {chat.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        m.role === "user"
                          ? "bg-[var(--land-accent)] text-white"
                          : "bg-[var(--land-bg)] text-[var(--land-bright)] border border-[var(--land-border)]"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-[var(--land-border)] bg-[var(--land-bg)] px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--land-accent)]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendChat();
                  }}
                  disabled={sending}
                  placeholder={T(
                    "e.g. make it navy, hide education, punch up my summary",
                    "مثال: خليه كحلي، أخفِ التعليم، حسّن النبذة"
                  )}
                  className="flex-1 rounded-lg border border-[var(--land-border)] bg-[var(--land-bg)] px-3 py-2 text-sm text-[var(--land-bright)] outline-none focus:border-[var(--land-accent)]"
                />
                <button
                  onClick={sendChat}
                  disabled={sending || !chatInput.trim()}
                  className="rounded-lg bg-[var(--land-accent)] p-2.5 text-white hover:bg-[var(--land-accent-hover)] disabled:opacity-50"
                >
                  <Send className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT: live preview */}
          <div className="relative flex min-h-[60vh] flex-col rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)]/30 lg:sticky lg:top-4 lg:h-[calc(100vh-7rem)]">
            {/* preview toolbar */}
            <div className="flex items-center justify-between gap-2 border-b border-[var(--land-border)] px-3 py-2">
              <div className="inline-flex rounded-lg border border-[var(--land-border)] p-0.5">
                <button
                  onClick={() => setView("live")}
                  className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium ${
                    view === "live"
                      ? "bg-[var(--land-accent)] text-white"
                      : "text-[var(--land-body)]"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" /> {T("Portfolio", "البورتفوليو")}
                </button>
                <button
                  onClick={() => setView("cv")}
                  className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium ${
                    view === "cv"
                      ? "bg-[var(--land-accent)] text-white"
                      : "text-[var(--land-body)]"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" /> {T("CV PDF", "السيرة PDF")}
                </button>
              </div>
              {view === "live" && (
                <div className="inline-flex gap-1 text-[var(--land-body)]">
                  {(
                    [
                      ["desktop", Monitor],
                      ["tablet", Tablet],
                      ["mobile", Smartphone],
                    ] as const
                  ).map(([d, Icon]) => (
                    <button
                      key={d}
                      onClick={() => setDevice(d)}
                      className={`rounded-md p-1.5 ${
                        device === d
                          ? "bg-[var(--land-accent-subtle)] text-[var(--land-accent-hover)]"
                          : "hover:bg-[var(--land-surface)]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* the frame */}
            <div className="relative flex-1 overflow-hidden">
              <PreviewFrame
                portfolioData={previewData as any}
                deviceMode={device}
                view={view}
                liveUrlLabel={
                  portfolio?.slug
                    ? `portfolio-trimind.com/p/${portfolio.slug}`
                    : "portfolio-trimind.com"
                }
              />
              {!paid && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                  <span className="rotate-[-24deg] select-none text-5xl font-black uppercase tracking-widest text-black/5">
                    {T("Preview", "معاينة")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
