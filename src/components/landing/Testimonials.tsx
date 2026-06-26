"use client";

/**
 * Testimonials section — horizontal-scroll row of testimonial cards, bilingual.
 */
export function Testimonials({ isRTL }: { isRTL: boolean }) {
  const testimonials: {
    quote: string;
    name: string;
    role: string;
    initial: string;
    avatar: string;
  }[] = [
    {
      quote: isRTL
        ? "جربت ٣ مواقع قبله وما عجبني. هذا الموقع طلّع سيرة ذاتية ما توقعت إنها تطلع بهالجودة خلال ١٠ ثوانٍ."
        : "I tried 3 other sites and none impressed me. This one produced a CV I never expected at that quality in 10 seconds.",
      name: isRTL ? "فهد العتيبي" : "Fahad Al-Otaibi",
      role: isRTL ? "مدير مشاريع · الكويت" : "Project Manager · Kuwait",
      initial: isRTL ? "ف" : "F",
      avatar: "from-green to-green-mid",
    },
    {
      quote: isRTL
        ? "الذكاء الاصطناعي كتب نبذة عني أحسن من اللي كنت أكتبه بنفسي. وصلت لمقابلتين خلال أسبوع."
        : "The AI wrote a summary about me better than I could write myself. I landed two interviews within a week.",
      name: isRTL ? "سارة الرشيدي" : "Sarah Al-Rashidi",
      role: isRTL ? "محللة مالية · بنك الخليج" : "Financial Analyst · Gulf Bank",
      initial: isRTL ? "س" : "S",
      avatar: "from-gold to-yellow-400",
    },
    {
      quote: isRTL
        ? "بورتفوليو حي + PDF + كل هذا بدفعة واحدة بس؟ ما صدقت السعر. يستاهل عشرة أضعاف."
        : "A live portfolio + PDF + all of this for a single payment? I couldn't believe the price. It's worth ten times that.",
      name: isRTL ? "عبدالرحمن الكندري" : "Abdulrahman Al-Kandari",
      role: isRTL ? "مهندس كمبيوتر" : "Computer Engineer",
      initial: isRTL ? "ع" : "A",
      avatar: "from-ink-80 to-ink-50",
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-5">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold text-ink tracking-tight mb-8">
          {isRTL ? "ماذا يقول المحترفون" : "What professionals say"}
        </h2>
        <div
          className="flex overflow-x-auto gap-3 pb-3 -mx-5 px-5 scrollbar-hide"
          dir={isRTL ? "rtl" : "ltr"}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[260px] bg-white border border-ink-10 rounded-2xl shadow-sm p-5"
            >
              <div
                className={`flex gap-0.5 text-gold mb-3 ${
                  isRTL ? "flex-row-reverse justify-end" : ""
                }`}
                aria-hidden="true"
              >
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="text-sm leading-none">
                    &#9733;
                  </span>
                ))}
              </div>
              <p
                className={`text-sm text-ink leading-relaxed mb-4 ${
                  isRTL ? "text-right" : ""
                }`}
              >
                {t.quote}
              </p>
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse text-right" : ""
                }`}
              >
                <div
                  className={`h-10 w-10 flex-shrink-0 rounded-full grid place-items-center text-white font-bold bg-gradient-to-br ${t.avatar}`}
                  aria-hidden="true"
                >
                  {t.initial}
                </div>
                <div>
                  <p className="font-bold text-ink text-sm">{t.name}</p>
                  <p className="text-xs text-ink-30">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
