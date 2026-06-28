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
import { portfolioReady } from "@/lib/studio-view";
import { toCreateBasics, toUpdatePatch, type Cv } from "@/lib/cv-schema";
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
  X,
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
  // The CV that /api/parse-cv returns alongside the id. This is the INSTANT
  // preview source — it never waits on the racy portfolios.get query, which can
  // stay `undefined`/skipped while the browser Convex auth token attaches.
  const [parsedCv, setParsedCv] = useState<Cv | null>(null);
  // On-screen diagnostics (?debug=1) — so the owner can read the exact failure
  // point on prod without a console. Mobile-friendly fixed overlay below.
  const debugOn = searchParams.get("debug") === "1";
  const [dbg, setDbg] = useState<Record<string, unknown>>({});
  const [view, setView] = useState<"live" | "cv">("live");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [uploading, setUploading] = useState(false);
  const [parseError, setParseError] = useState("");
  const [pasteText, setPasteText] = useState("");
  // Multiple files (PDF / Word / image) collected before a single Generate call.
  const [files, setFiles] = useState<File[]>([]);
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

  // Ensure the Convex user row exists. Brand-new accounts land here straight
  // from sign-up (never through /dashboard, where provisioning used to live),
  // so without this the first create (/api/parse-cv) throws "Unauthenticated".
  const provisionUser = useMutation(api.users.upsertFromClerk);
  useEffect(() => {
    if (isAuthenticated) provisionUser({}).catch(() => {});
  }, [isAuthenticated, provisionUser]);

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
    if (primary) {
      setDbg((d) => ({ ...d, oneCvRedirect: primary._id }));
      router.replace(`/build/${primary._id}`);
    }
  }, [myList, initialId, portfolioId, router]);

  // Build a portfolio-shaped doc from the just-parsed CV using the SAME mappers
  // the server used to write it — so the instant preview is byte-identical to
  // what Convex stores. This paints immediately; no dependency on the get-query.
  const fallbackPortfolio = useMemo(() => {
    if (!parsedCv) return null;
    return {
      ...toUpdatePatch(parsedCv),
      basics: toCreateBasics(parsedCv),
      templateId: parsedCv.templateId,
      customization: {},
      status: "draft" as const,
    };
  }, [parsedCv]);

  // Reconcile: the live Convex doc wins the moment it loads (so edits/chat that
  // mutate Convex are reflected); until then fall back to the parsed CV.
  const effectivePortfolio: any = portfolio ?? fallbackPortfolio;

  const previewData = useMemo(
    () => (effectivePortfolio ? toPortfolioData(effectivePortfolio, locale) : null),
    [effectivePortfolio, locale]
  );

  const templateKey = (resolveTemplateId(effectivePortfolio?.templateId) ||
    "general") as TemplatePresetKey;
  const presets = COLOR_PRESETS[templateKey] || COLOR_PRESETS.general;
  const sections = SECTIONS_BY_TEMPLATE[templateKey] || GENERAL_SECTIONS;
  const cust: any = effectivePortfolio?.customization || {};
  const hidden: string[] = cust.hiddenSections || [];
  const paid =
    effectivePortfolio?.status === "paid" ||
    effectivePortfolio?.status === "published";

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
    (id: string, cv?: Cv) => {
      if (cv) setParsedCv(cv); // instant preview source (no get-query wait)
      setPortfolioId(id);
      // Keep the id in the URL so a refresh resumes the same draft. Stay on the
      // SAME route (replaceState, not router.replace to /build/[id]) — a route
      // change would remount and discard `parsedCv`, re-blanking on the race.
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

  const fmtSize = (n: number) =>
    n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;

  // Collect files (no auto-build); cap at 5 to match the server.
  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setParseError("");
    // Snapshot the FileList NOW: the picker's onChange clears the input
    // (e.target.value = "") immediately after this call, which empties the live
    // FileList before React runs a deferred setFiles updater — so reading
    // Array.from(list) inside the updater got nothing on iOS Safari (file never
    // attached). Materialise the array synchronously here instead.
    const picked = Array.from(list);
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
  }
  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  // Single entry point: all files + pasted text + notes → one parse, then preview.
  async function generate() {
    const text = pasteText.trim();
    if (files.length === 0 && text.length < 20) {
      setParseError(T("Add a file or paste your CV first.", "أضف ملفًا أو الصق سيرتك أولًا."));
      return;
    }
    setUploading(true);
    setParseError("");
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("file", f));
      fd.append("locale", locale);
      if (text) fd.append("text", text);
      if (instructions.trim()) fd.append("instructions", instructions.trim());
      const res = await fetch("/api/parse-cv", { method: "POST", body: fd });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        /* non-JSON / empty body — handled below */
      }
      setDbg((d) => ({
        ...d,
        files: files.length,
        pasted: text.length >= 20,
        status: res.status,
        hadId: !!data?.portfolioId,
        hadCv: !!data?.data?.basics,
        cvName: data?.data?.basics?.fullName || "",
      }));
      if (!res.ok) throw new Error(data.error || "Parse failed");
      onParsed(data.portfolioId, data.data as Cv | undefined);
    } catch (e: any) {
      setParseError(e?.message || T("Couldn't build that.", "تعذّر البناء."));
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
  // Ready only when the get-query has actually resolved to a doc. Treating the
  // still-loading `undefined` as ready blanks the screen right after a parse.
  // Ready when EITHER the live get-query resolved OR we have the parsed CV in
  // hand — the latter is what guarantees an instant paint after a fresh upload.
  const hasPortfolio =
    portfolioReady(portfolioId, portfolio) ||
    (!!portfolioId && !!fallbackPortfolio);
  // Only show the "loading draft…" spinner in edit mode (no instant fallback);
  // a fresh upload has fallbackPortfolio so it skips straight to the preview.
  const loadingDoc =
    !!portfolioId && portfolio === undefined && !fallbackPortfolio;

  return (
    <div className="flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      {debugOn && (
        <div
          dir="ltr"
          className="fixed inset-x-2 bottom-2 z-[9999] max-h-[45vh] overflow-auto rounded-lg bg-black/90 p-3 font-mono text-[11px] leading-relaxed text-green-400 shadow-2xl"
        >
          <div className="mb-1 font-bold text-white">CV upload debug — portfolio-trimind.com</div>
          <div>isAuthenticated: {String(isAuthenticated)}</div>
          <div>files selected: {String(dbg.files ?? "—")}</div>
          <div>pasted text: {String(dbg.pasted ?? "—")}</div>
          <div>parse-cv HTTP status: {String(dbg.status ?? "— (not sent yet)")}</div>
          <div>response had portfolioId: {String(dbg.hadId ?? "—")}</div>
          <div>
            response had cv data: {String(dbg.hadCv ?? "—")}
            {dbg.cvName ? ` (${dbg.cvName})` : ""}
          </div>
          <div>portfolioId state: {portfolioId ?? "null"}</div>
          <div>
            get-query (portfolios.get):{" "}
            {portfolio === undefined
              ? "undefined → loading or skipped"
              : portfolio === null
              ? "null → not-found / not-owner"
              : "object → loaded ✓"}
          </div>
          <div>
            preview source:{" "}
            {portfolio
              ? "LIVE Convex doc"
              : fallbackPortfolio
              ? "PARSED CV (instant) ✓"
              : "none → blank"}
          </div>
          <div>one-CV redirect fired: {dbg.oneCvRedirect ? `yes → ${dbg.oneCvRedirect}` : "no"}</div>
          <div>parseError: {parseError || "none"}</div>
        </div>
      )}
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
                  addFiles(e.dataTransfer.files);
                }}
                className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--land-border)] bg-[var(--land-surface)]/40 px-6 py-12 text-center transition-colors hover:border-[var(--land-accent)]"
              >
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.md,image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = ""; // allow re-selecting the same file
                  }}
                />
                <Upload className="h-8 w-8 text-[var(--land-accent)]" />
                <span className="mt-3 font-medium text-[var(--land-bright)]">
                  {T("Drop your CV files or click to upload", "أفلت ملفات سيرتك أو اضغط للرفع")}
                </span>
                <span className="mt-1 text-xs text-[var(--land-muted)]">
                  {T(
                    "PDF · Word · images — up to 5 files, ≤ 8 MB each",
                    "PDF · Word · صور — حتى ٥ ملفات، ٨ ميغا لكل ملف"
                  )}
                </span>
              </label>

              {/* selected files (removable) — nothing is parsed until Generate */}
              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-2 rounded-lg border border-[var(--land-border)] bg-[var(--land-bg)] px-3 py-2 text-sm"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-[var(--land-accent)]" />
                      <span className="flex-1 truncate text-[var(--land-bright)]">{f.name}</span>
                      <span className="text-xs text-[var(--land-muted)]">{fmtSize(f.size)}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        disabled={uploading}
                        aria-label={T("Remove", "إزالة")}
                        className="text-[var(--land-muted)] hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

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
                {T("and / or paste it", "و/أو الصقها")}
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

              {/* Single Generate gate — nothing redirects to preview until this. */}
              <button
                onClick={generate}
                disabled={uploading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--land-accent)] py-3.5 text-base font-semibold text-white hover:bg-[var(--land-accent-hover)] disabled:opacity-60 transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {T("Building your portfolio…", "جارٍ بناء بورتفوليوك…")}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {T("Generate my portfolio", "أنشئ بورتفوليو")}
                  </>
                )}
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
                <p className="mb-0.5 text-xs font-semibold text-[var(--land-bright)]">
                  {T("Custom colours", "ألوان مخصصة")}
                </p>
                <p className="mb-2 text-[11px] text-[var(--land-muted)]">
                  {T("Pick any colour — primary, accent & background", "اختر أي لون — الأساسي والمميّز والخلفية")}
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
                  effectivePortfolio?.slug
                    ? `portfolio-trimind.com/p/${effectivePortfolio.slug}`
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
