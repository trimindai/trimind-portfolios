"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface PreviewFrameProps {
  portfolioData: Record<string, any>;
  deviceMode: "desktop" | "tablet" | "mobile";
  /**
   * Which artifact to render in the iframe.
   * - "cv"   → the ATS A4 PDF CV (printed output, carries the QR)
   * - "live" → the flashy live web portfolio template
   * Defaults to "cv" so `print()` always produces the ATS CV.
   */
  view?: "cv" | "live";
}

export interface PreviewFrameHandle {
  print: () => void;
}

const deviceWidths: Record<string, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const PreviewFrame = forwardRef<PreviewFrameHandle, PreviewFrameProps>(
  function PreviewFrame({ portfolioData, deviceMode, view = "cv" }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [html, setHtml] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      print: () => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.print();
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
          if (!cancelled) {
            setHtml(data.html);
          }
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : "Failed to generate preview"
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      generate();
      return () => {
        cancelled = true;
      };
    }, [portfolioData, view]);

    const isNarrow = deviceMode !== "desktop";
    const width = deviceWidths[deviceMode];

    return (
      <div className="relative flex h-full flex-col items-center">
        <div
          className={`flex h-full w-full items-start justify-center overflow-auto ${
            isNarrow ? "bg-[var(--land-bg)] p-8" : ""
          }`}
        >
          {loading ? (
            <div className="flex h-96 w-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--land-accent)]" />
                <span className="text-sm text-[var(--land-body)]">
                  Generating preview...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-96 w-full items-center justify-center">
              <div className="rounded-lg bg-red-950/50 p-6 text-center">
                <p className="text-red-400">{error}</p>
                <p className="mt-2 text-sm text-[var(--land-muted)]">
                  Please try again or check your portfolio data.
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`h-full transition-all duration-300 ${
                isNarrow
                  ? "rounded-lg shadow-2xl shadow-black/50 ring-1 ring-[var(--land-border)]"
                  : ""
              }`}
              style={{ width, maxWidth: "100%" }}
            >
              <iframe
                ref={iframeRef}
                srcDoc={html}
                className="h-full w-full border-0 bg-white"
                style={{ minHeight: "calc(100vh - 120px)" }}
                title="Portfolio Preview"
                sandbox="allow-same-origin allow-popups allow-scripts allow-modals"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default PreviewFrame;
