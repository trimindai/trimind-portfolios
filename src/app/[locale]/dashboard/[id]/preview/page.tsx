"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useMemo, useRef } from "react";
import { Monitor, Tablet, Smartphone, ArrowLeft, Download } from "lucide-react";
import PreviewFrame from "@/components/preview/PreviewFrame";
import type { PreviewFrameHandle } from "@/components/preview/PreviewFrame";
import { toPortfolioData } from "@/lib/portfolio-data";

type DeviceMode = "desktop" | "tablet" | "mobile";

export default function PreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = (params.locale as string) || "en";
  const t = useTranslations("preview");
  const tc = useTranslations("common");
  const previewRef = useRef<PreviewFrameHandle>(null);

  const portfolio = useQuery(api.portfolios.get, {
    id: id as Id<"portfolios">,
  });

  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");

  const portfolioData = useMemo(() => {
    if (!portfolio) return null;
    return toPortfolioData(portfolio, locale);
  }, [portfolio, locale]);

  if (portfolio === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm text-slate-400">{tc("loading")}</span>
        </div>
      </div>
    );
  }

  if (portfolio === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-400">Portfolio not found.</p>
      </div>
    );
  }

  const devices: { mode: DeviceMode; icon: typeof Monitor; label: string }[] = [
    { mode: "desktop", icon: Monitor, label: t("desktop") },
    { mode: "tablet", icon: Tablet, label: t("tablet") },
    { mode: "mobile", icon: Smartphone, label: t("mobile") },
  ];

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      {/* Top toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
        <Link
          href={`/dashboard/${id}/edit`}
          className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToEdit")}
        </Link>

        <div className="flex items-center gap-1 rounded-lg bg-slate-800/50 p-1">
          {devices.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setDeviceMode(mode)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                deviceMode === mode
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
              title={label}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <Link
          href={`/dashboard/${id}/publish`}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          {tc("publish")}
        </Link>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-hidden relative">
        {portfolioData && (
          <PreviewFrame ref={previewRef} portfolioData={portfolioData} deviceMode={deviceMode} />
        )}

        {/* Floating Save PDF button */}
        <button
          onClick={() => previewRef.current?.print()}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
        >
          <Download className="h-4 w-4" />
          Save PDF / Print
        </button>
      </div>
    </div>
  );
}
