"use client";

import { useState } from "react";
import Image from "next/image";

// Hero "how it works" reel. Click-to-play (never autoplay → mobile/RTL safe).
// Until the recorded mp4 ships, `src` is omitted and the poster links to a live
// demo instead, so the slot is never a dead video.
// ponytail: drop the mp4 at `src` (Phase 3) and pass it in — the player just works.
export function HeroReel({
  locale,
  poster,
  src,
  demoHref,
}: {
  locale: string;
  poster: string;
  src?: string;
  demoHref: string;
}) {
  const isRTL = locale === "ar";
  const [playing, setPlaying] = useState(false);
  const label = isRTL ? "شاهد كيف يعمل" : "Watch how it works";
  const sub = isRTL ? "جولة قصيرة في الموقع" : "A quick tour";

  if (playing && src) {
    return (
      <div className="relative w-full aspect-[9/16] overflow-hidden rounded-xl border border-[var(--land-border)] shadow-lg">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video className="h-full w-full object-cover" src={src} controls autoPlay playsInline />
      </div>
    );
  }

  const overlay = (
    <>
      <Image
        src={poster}
        alt={label}
        width={1200}
        height={1200}
        sizes="(min-width: 1024px) 384px, 100vw"
        className="h-full w-full object-cover"
        priority
        quality={85}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 transition-colors group-hover:bg-black/40">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg ring-4 ring-white/25 transition-transform group-hover:scale-105">
          <svg className="h-7 w-7 translate-x-0.5 text-[var(--land-accent)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="mt-3 text-sm font-semibold text-white drop-shadow">{label}</span>
        <span className="text-xs text-white/80 drop-shadow">{sub}</span>
      </div>
    </>
  );

  const cls =
    "group relative block w-full aspect-[9/16] overflow-hidden rounded-xl border border-[var(--land-border)] shadow-lg";

  return src ? (
    <button type="button" onClick={() => setPlaying(true)} className={`${cls} text-start`} aria-label={label}>
      {overlay}
    </button>
  ) : (
    <a href={demoHref} target="_blank" rel="noopener noreferrer" className={cls} aria-label={label}>
      {overlay}
    </a>
  );
}
