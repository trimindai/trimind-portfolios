"use client";

import { useState, useEffect } from "react";

type Profile = {
  name: string;
  title: string;
  company: string;
  bio: string;
  skills: string[];
};

const PROFILES_AR: Profile[] = [
  {
    name: "سارة الرشيدي",
    title: "محللة مالية أولى",
    company: "بنك الخليج الدولي",
    bio: "محللة مالية دقيقة بخبرة تزيد عن ٦ سنوات في القطاع المصرفي، متخصصة في إدارة المخاطر وتحليل المحافظ الاستثمارية.",
    skills: ["Excel", "Bloomberg", "التحليل المالي", "Python"],
  },
  {
    name: "عبدالرحمن الكندري",
    title: "مهندس برمجيات",
    company: "شركة زين للاتصالات",
    bio: "مهندس برمجيات متخصص في تطوير تطبيقات الويب والجوال بخبرة ٤ سنوات في بيئات Agile وتقنيات React وNode.js.",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
  },
  {
    name: "فهد العتيبي",
    title: "مدير مشاريع",
    company: "مجموعة KIPCO",
    bio: "مدير مشاريع محترف يقود فرقاً متعددة التخصصات لتسليم مشاريع بقيمة تتجاوز ٢ مليون دينار في الوقت المحدد.",
    skills: ["PMP", "Agile", "MS Project", "التفاوض"],
  },
  {
    name: "نورة السالم",
    title: "مصممة UX/UI",
    company: "استوديو إبداع",
    bio: "مصممة تجربة مستخدم مبدعة تحول الأفكار المعقدة إلى واجهات بسيطة وجميلة، أثّرت في تجربة أكثر من ٥٠٠ ألف مستخدم.",
    skills: ["Figma", "Prototyping", "User Research", "Tailwind"],
  },
];

const PROFILES_EN: Profile[] = [
  {
    name: "Sarah Al-Rashidi",
    title: "Senior Financial Analyst",
    company: "Gulf International Bank",
    bio: "Detail-oriented financial analyst with over 6 years in the banking sector, specialising in risk management and investment portfolio analysis.",
    skills: ["Excel", "Bloomberg", "Financial Analysis", "Python"],
  },
  {
    name: "Abdulrahman Al-Kandari",
    title: "Software Engineer",
    company: "Zain Telecom",
    bio: "Software engineer focused on building web and mobile applications, with 4 years of experience in Agile environments using React and Node.js.",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
  },
  {
    name: "Fahad Al-Otaibi",
    title: "Project Manager",
    company: "KIPCO Group",
    bio: "Professional project manager leading cross-functional teams to deliver projects worth over 2 million dinars, consistently on time.",
    skills: ["PMP", "Agile", "MS Project", "Negotiation"],
  },
  {
    name: "Noura Al-Salem",
    title: "UX/UI Designer",
    company: "Ibdaa Studio",
    bio: "Creative UX designer who turns complex ideas into simple, beautiful interfaces, shaping the experience of more than 500,000 users.",
    skills: ["Figma", "Prototyping", "User Research", "Tailwind"],
  },
];

const CHAR_DELAY = 30; // ms per character while typing the bio
const HOLD_DELAY = 3000; // ms to hold a completed profile before cycling

export default function AiDemoStrip({ locale = "en" }: { locale?: string }) {
  const isRTL = locale === "ar";
  const profiles = isRTL ? PROFILES_AR : PROFILES_EN;

  const [profileIndex, setProfileIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedBio, setDisplayedBio] = useState("");
  const [progress, setProgress] = useState(0);

  const profile = profiles[profileIndex];

  // Reset typing state whenever the active profile changes.
  useEffect(() => {
    setCharIndex(0);
    setDisplayedBio("");
    setProgress(0);
  }, [profileIndex]);

  // Advance the typewriter one character at a time, then cycle to the next profile.
  useEffect(() => {
    const bio = profiles[profileIndex].bio;

    if (charIndex < bio.length) {
      const typeTimer = setTimeout(() => {
        const nextCharIndex = charIndex + 1;
        setCharIndex(nextCharIndex);
        setDisplayedBio(bio.slice(0, nextCharIndex));
        setProgress(Math.round((nextCharIndex / bio.length) * 85));
      }, CHAR_DELAY);
      return () => clearTimeout(typeTimer);
    }

    const cycleTimer = setTimeout(() => {
      setProfileIndex((prev) => (prev + 1) % profiles.length);
    }, HOLD_DELAY);
    return () => clearTimeout(cycleTimer);
  }, [charIndex, profileIndex, profiles]);

  const isTyping = charIndex < profile.bio.length;

  const rows: { label: string; value: string }[] = [
    { label: isRTL ? "الاسم" : "Name", value: profile.name },
    { label: isRTL ? "المسمى" : "Title", value: profile.title },
    { label: isRTL ? "الشركة" : "Company", value: profile.company },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="relative w-full max-w-sm mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-ink-80 p-5">
        {/* Soft green glow blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-green-mid/20 blur-2xl"
        />

        <div className="relative">
          {/* Top label */}
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-bright animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-green-bright">
              {isRTL ? "الذكاء الاصطناعي يكتب الآن" : "AI is writing now"}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-2 text-base font-bold text-white">
            {isRTL ? "شاهد كيف يبني الذكاء الاصطناعي سيرتك ✨" : "Watch AI build your CV ✨"}
          </h3>

          {/* Data card */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="space-y-2.5">
              {rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    {row.label}
                  </span>
                  <span className="text-sm font-medium text-white text-end">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Typewriting summary */}
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                {isRTL ? "النبذة" : "Summary"}
              </p>
              <p className="mt-1 min-h-[3.5rem] text-sm leading-relaxed text-white/80">
                {displayedBio}
                {isTyping && <span className="text-green-bright animate-pulse">|</span>}
              </p>
            </div>

            {/* Skills pills */}
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                {isRTL ? "المهارات" : "Skills"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.skills.map((skill, i) => (
                  <span
                    key={skill}
                    className="rounded-full border border-green-mid/30 bg-green-mid/20 px-2 py-1 text-[10px] text-green-bright opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-l from-green-bright to-green transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-white/40">
              <span>{isRTL ? "يكتب السيرة الذاتية..." : "Writing your CV..."}</span>
              <span>{isRTL ? "~١٠ ثوانٍ" : "~10 sec"}</span>
            </div>
          </div>

          {/* Ghost button */}
          <button
            type="button"
            className="mt-4 w-full rounded-xl border border-green-bright/60 py-2.5 text-sm font-medium text-green-bright transition-colors hover:bg-green-bright/10"
          >
            {isRTL ? "▶ شاهد النتيجة كاملة" : "▶ See the full result"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
