"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Loader2 } from "lucide-react";

interface PreviewFrameProps {
  portfolioData: Record<string, any>;
  deviceMode: "desktop" | "tablet" | "mobile";
  /**
   * Which artifact to render in the iframe.
   * - "cv"   → the ATS A4 PDF CV (printed output, carries the QR)
   * - "live" → the flashy live web portfolio template
   */
  view?: "cv" | "live";
  /** CV-only zoom. "fit" scales the A4 page to the panel width. */
  cvZoom?: "fit" | number;
  /** Used in the live phone frame caption (the QR target). */
  liveUrlLabel?: string;
}

export interface PreviewFrameHandle {
  print: () => void;
}

// A4 portrait at 96dpi (210mm). Live content widths per device.
const A4_WIDTH = 794;
const LIVE_WIDTHS: Record<string, number> = {
  desktop: 1280,
  tablet: 834,
  mobile: 390,
};

const PreviewFrame = forwardRef<PreviewFrameHandle, PreviewFrameProps>(
  function PreviewFrame(
    { portfolioData, deviceMode, view = "cv", cvZoom = "fit", liveUrlLabel },
    ref
  ) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [html, setHtml] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [containerW, setContainerW] = useState(0);
    const [cvHeight, setCvHeight] = useState(1123); // default: one A4 page

    useImperativeHandle(ref, () => ({
      print: () => {
        if (!html) return;
        // New window + blob URL so contentWindow.print() works on mobile too.
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, "_blank");
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            URL.revokeObjectURL(url);
          };
        } else {
          URL.revokeObjectURL(url);
          iframeRef.current?.contentWindow?.print();
        }
      },
    }));

    const lastDataRef = useRef<string>("");

    useEffect(() => {
      const dataJson = view + ":" + JSON.stringify(portfolioData);
      if (dataJson === lastDataRef.current) return;
      lastDataRef.current = dataJson;

      let cancelled = false;
      async function generate() {
        setLoading(true);
        setError(null);
        try {
          const endpoint = view === "cv" ? "/api/generate-cv" : "/api/generate";
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(portfolioData),
          });
          if (!res.ok) throw new Error("Generation failed");
          const data = await res.json();
          if (!cancelled) setHtml(data.html);
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : "Failed to generate preview"
            );
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
      generate();
      return () => {
        cancelled = true;
      };
    }, [portfolioData, view]);

    // Track the scroll container width so "fit" can size the A4 page.
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const update = () => setContainerW(el.clientWidth);
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, [view, loading]);

    // Measure the rendered CV height so the A4 "paper" is exactly as tall as
    // the document (the outer panel scrolls; the page itself doesn't).
    const onCvLoad = () => {
      try {
        const doc = iframeRef.current?.contentDocument;
        if (doc) {
          const h = Math.max(
            doc.body?.scrollHeight || 0,
            doc.documentElement?.scrollHeight || 0
          );
          if (h > 0) setCvHeight(h);
        }
      } catch {
        /* same-origin srcDoc, but stay safe */
      }
    };

    if (loading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--land-accent)]" />
            <span className="text-sm text-[var(--land-body)]">
              Generating preview...
            </span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="rounded-lg bg-red-950/50 p-6 text-center">
            <p className="text-red-400">{error}</p>
            <p className="mt-2 text-sm text-[var(--land-muted)]">
              Please try again or check your portfolio data.
            </p>
          </div>
        </div>
      );
    }

    // ── CV view: A4 paper with zoom / fit ─────────────────────────────
    if (view === "cv") {
      const fit =
        containerW > 0
          ? Math.max(0.2, Math.min(1, (containerW - 48) / A4_WIDTH))
          : 1;
      const scale = cvZoom === "fit" ? fit : cvZoom;
      return (
        <div
          ref={scrollRef}
          className="h-full w-full overflow-auto bg-[var(--land-surface-raised)]/40"
        >
          <div className="flex justify-center p-6">
            {/* Outer box sized to the SCALED paper so scrollbars are correct */}
            <div
              style={{
                width: A4_WIDTH * scale,
                height: cvHeight * scale,
              }}
            >
              <div
                className="bg-white shadow-2xl shadow-black/30 ring-1 ring-black/10"
                style={{
                  width: A4_WIDTH,
                  height: cvHeight,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <iframe
                  ref={iframeRef}
                  srcDoc={html}
                  onLoad={onCvLoad}
                  className="block border-0 bg-white"
                  style={{ width: A4_WIDTH, height: cvHeight }}
                  title="CV Preview"
                  sandbox="allow-same-origin allow-popups allow-scripts allow-modals"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── Live view: real device frames ─────────────────────────────────
    const liveW = LIVE_WIDTHS[deviceMode];
    const frameIframe = (
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="Portfolio Preview"
        sandbox="allow-same-origin allow-popups allow-scripts allow-modals"
        className="block h-full w-full border-0 bg-white"
      />
    );

    if (deviceMode === "mobile") {
      // Phone bezel + notch. iframe at 390px, scrolls internally.
      return (
        <div
          ref={scrollRef}
          className="flex h-full w-full flex-col items-center gap-3 overflow-auto bg-[var(--land-surface-raised)]/40 p-6 max-md:gap-2 max-md:p-0"
        >
          {/* md+: realistic phone bezel. On a real phone (<md) the bezel would
              overflow the viewport ("phone inside a phone"), so we drop the
              frame/notch and let the portfolio fill the width edge-to-edge. */}
          <div
            className="relative shrink-0 rounded-[2.6rem] border-[11px] border-neutral-900 bg-neutral-900 shadow-2xl shadow-black/40 max-md:!w-full max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:shadow-none"
            style={{ width: liveW + 22 }}
          >
            <div className="absolute left-1/2 top-2 z-10 h-1.5 w-20 -translate-x-1/2 rounded-full bg-neutral-700 max-md:hidden" />
            <div
              className="overflow-hidden rounded-[1.9rem] bg-white max-md:!h-[calc(100dvh-140px)] max-md:!w-full max-md:rounded-none"
              style={{ width: liveW, height: "min(844px, calc(100vh - 220px))" }}
            >
              {frameIframe}
            </div>
          </div>
          <p className="px-4 text-center text-xs text-[var(--land-muted)] max-md:pb-2">
            {liveUrlLabel
              ? `What people see when they scan your CV's QR code → ${liveUrlLabel}`
              : "What people see when they scan your CV's QR code"}
          </p>
        </div>
      );
    }

    if (deviceMode === "tablet") {
      return (
        <div
          ref={scrollRef}
          className="flex h-full w-full items-start justify-center overflow-auto bg-[var(--land-surface-raised)]/40 p-6"
        >
          <div
            className="shrink-0 overflow-hidden rounded-[1.6rem] border-[12px] border-neutral-900 bg-neutral-900 shadow-2xl shadow-black/40"
            style={{ width: liveW + 24 }}
          >
            <div
              className="overflow-hidden rounded-xl bg-white"
              style={{ width: liveW, height: "calc(100vh - 200px)", minHeight: 640 }}
            >
              {frameIframe}
            </div>
          </div>
        </div>
      );
    }

    // desktop → browser window chrome
    return (
      <div
        ref={scrollRef}
        className="flex h-full w-full items-start justify-center overflow-auto bg-[var(--land-surface-raised)]/40 p-6"
      >
        <div
          className="w-full overflow-hidden rounded-xl border border-[var(--land-border)] bg-white shadow-2xl shadow-black/30"
          style={{ maxWidth: liveW }}
        >
          <div className="flex items-center gap-2 border-b border-[var(--land-border)] bg-[var(--land-surface)] px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <div className="ml-3 flex-1 truncate rounded-md bg-[var(--land-bg)] px-3 py-1 text-xs text-[var(--land-muted)]">
              {liveUrlLabel || "portfolio-trimind.com"}
            </div>
          </div>
          <div style={{ height: "calc(100vh - 200px)", minHeight: 560 }}>
            {frameIframe}
          </div>
        </div>
      </div>
    );
  }
);

export default PreviewFrame;
