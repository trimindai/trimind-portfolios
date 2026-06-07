"use client";

/**
 * Testimonials section — horizontal scrollable on mobile, 3-col grid on desktop.
 */
export function Testimonials({ isRTL }: { isRTL: boolean }) {
  const testimonials = [
    {
      stars: 5,
      quote: isRTL
        ? "حصلت على مقابلة في نفس الأسبوع اللي أرسلت فيه رابط بورتفوليوي. مسؤولي التوظيف علّقوا عليه فعلاً."
        : "Got an interview the same week I sent my portfolio link. Recruiters actually commented on it.",
      name: isRTL ? "أحمد ك." : "Ahmed K.",
      role: isRTL ? "محلل مالي، الكويت" : "Financial Analyst, Kuwait",
    },
    {
      stars: 5,
      quote: isRTL
        ? "تصميم العربي جميل فعلاً. أخيرًا أداة سيرة ذاتية تفهم سوقنا."
        : "The Arabic layout is genuinely beautiful. Finally a CV tool that understands our market.",
      name: isRTL ? "فاطمة ع." : "Fatima A.",
      role: isRTL ? "مديرة موارد بشرية، الكويت" : "HR Manager, Kuwait",
    },
    {
      stars: 5,
      quote: isRTL
        ? "أخذ مني ٢٠ دقيقة. سيرتي القديمة أخذت من المصمم ٣ أيام وكلفتني ٥٠ دك."
        : "Took me 20 minutes. My old CV took a designer 3 days and cost me 50 KD.",
      name: isRTL ? "عمر س." : "Omar S.",
      role: isRTL ? "مهندس مدني، الكويت" : "Civil Engineer, Kuwait",
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--land-bright)] mb-10">
          {isRTL ? "ماذا يقول المحترفون" : "What professionals say"}
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="min-w-[280px] sm:min-w-0 snap-start rounded-xl border border-[var(--land-border)] bg-white p-5 shadow-sm"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="text-amber-400 text-sm">
                    &#9733;
                  </span>
                ))}
              </div>
              <p className="text-sm text-[var(--land-body)] leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-medium text-[var(--land-bright)]">
                  {t.name}
                </p>
                <p className="text-xs text-[var(--land-muted)]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
