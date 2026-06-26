/**
 * "3 simple steps" — a clean vertical walkthrough.
 * Each step: a green numbered circle, a bold title, and a muted description,
 * joined by a faint side-neutral vertical connector that works in LTR and RTL.
 */

type Step = {
  /** Localised circle numeral (Arabic-Indic for AR, Western for EN). */
  num: string;
  title: string;
  desc: string;
};

export function HowItWorks({ isRTL }: { isRTL: boolean }) {
  const steps: Step[] = [
    {
      num: isRTL ? "١" : "1",
      title: isRTL ? "أدخل اسمك ومسماك" : "Enter your name & title",
      desc: isRTL
        ? "بس هذا. الذكاء الاصطناعي يكتب النبذة والمهارات تلقائياً."
        : "That's it. AI writes your summary and skills automatically.",
    },
    {
      num: isRTL ? "٢" : "2",
      title: isRTL ? "اختر القالب" : "Pick a template",
      desc: isRTL
        ? "قوالب مصممة لكل مجال. عاين بشكل حي قبل ما تختار."
        : "Templates designed per field. Preview live before you choose.",
    },
    {
      num: isRTL ? "٣" : "3",
      title: isRTL ? "ادفع فقط لما تعجبك" : "Pay only when you love it",
      desc: isRTL
        ? "٤.٩٠٠ د.ك دفعة واحدة. بدون اشتراك. نشر فوري."
        : "4.900 KD one-time. No subscription. Instant publish.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-bold text-ink tracking-tight text-center">
          {isRTL ? "٣ خطوات بسيطة" : "3 simple steps"}
        </h2>

        <ol className="mt-12">
          {steps.map((step, i) => (
            <li key={step.num}>
              <div
                className={`flex items-start gap-4 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <div
                  aria-hidden="true"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-green to-green-mid font-bold text-white"
                >
                  {step.num}
                </div>
                <div className="pt-1.5">
                  <h3 className="font-bold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink-50">{step.desc}</p>
                </div>
              </div>

              {/* Faint connector under the circle's column — side-neutral for LTR/RTL */}
              {i < steps.length - 1 && (
                <div className="w-10 shrink-0" aria-hidden="true">
                  <div className="mx-auto h-8 w-px bg-green-mid/25" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
