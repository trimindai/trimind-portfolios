"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Printer } from "lucide-react";

interface PreviewFrameProps {
  portfolioData: Record<string, unknown>;
  deviceMode: "desktop" | "tablet" | "mobile";
}

const deviceWidths: Record<string, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export default function PreviewFrame({
  portfolioData,
  deviceMode,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/generate", {
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
  }, [portfolioData]);

  function handlePrint() {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  }

  const isNarrow = deviceMode !== "desktop";
  const width = deviceWidths[deviceMode];

  return (
    <div className="relative flex h-full flex-col items-center">
      {/* Print button */}
      <button
        onClick={handlePrint}
        className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
      >
        <Printer className="h-4 w-4" />
        Print
      </button>

      {/* iframe container */}
      <div
        className={`flex h-full w-full items-start justify-center overflow-auto ${
          isNarrow ? "bg-slate-950 p-8" : ""
        }`}
      >
        {loading ? (
          <div className="flex h-96 w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="text-sm text-slate-400">
                Generating preview...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-96 w-full items-center justify-center">
            <div className="rounded-lg bg-red-950/50 p-6 text-center">
              <p className="text-red-400">{error}</p>
              <p className="mt-2 text-sm text-slate-500">
                Please try again or check your portfolio data.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`h-full transition-all duration-300 ${
              isNarrow
                ? "rounded-lg shadow-2xl shadow-black/50 ring-1 ring-slate-700"
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
              sandbox="allow-same-origin allow-popups allow-scripts"
            />
          </div>
        )}
      </div>
    </div>
  );
}
