export default function MiniCvPreview() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="h-px flex-1 bg-ink-10" />
        <span className="text-[11px] font-bold text-[#374151] tracking-wider uppercase whitespace-nowrap">مثال على النتيجة</span>
        <div className="h-px flex-1 bg-ink-10" />
      </div>
      <div className="bg-white border border-ink-10 rounded-2xl shadow-md overflow-hidden">
        <div className="bg-[#1a2744] px-4 py-4">
          <p className="text-white font-bold text-base leading-none mb-0.5">سارة الرشيدي</p>
          <p className="text-blue-200 text-xs">محللة مالية أولى · بنك الخليج الدولي</p>
          <div className="flex flex-wrap gap-3 mt-2">
            {['Kuwait City', 'sarah@email.com', '+965 9999 0000'].map(t => (
              <span key={t} className="text-[9px] text-blue-200/60">{t}</span>
            ))}
          </div>
        </div>
        <div className="px-4 py-3 space-y-3">
          <div className="flex gap-4">
            {[['١٠+', 'سنوات خبرة'], ['٣٥+', 'عميل'], ['٦', 'شهادات']].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="text-xs font-bold text-ink">{n}</p>
                <p className="text-[9px] text-ink-30">{l}</p>
              </div>
            ))}
          </div>
          <div className="h-px bg-ink-10" />
          <div>
            <p className="text-[9px] font-bold text-ink-30 uppercase tracking-wider mb-1">النبذة</p>
            <p className="text-[10px] text-ink-50 leading-relaxed text-right">
              محللة مالية دقيقة بخبرة تزيد عن ١٠ سنوات في القطاع المصرفي، متخصصة في إدارة المخاطر وتحليل المحافظ الاستثمارية.
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-ink-30 uppercase tracking-wider mb-1.5">المهارات</p>
            <div className="flex flex-wrap gap-1 justify-end">
              {['Excel', 'Bloomberg', 'التحليل المالي', 'Python', 'إدارة المخاطر'].map(s => (
                <span key={s} className="text-[9px] px-2 py-0.5 rounded-full bg-ink-10 text-ink-50 font-medium">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-ink-10 px-4 py-2 flex justify-between items-center">
          <span className="text-[9px] text-green-mid font-bold">✓ جاهز للنشر</span>
          <span className="text-[9px] text-ink-30">portfolio-trimind.com/sarah</span>
        </div>
      </div>
      <div className="flex justify-center mt-3">
        <a
          href="/demo/corporate/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-green-mid hover:underline"
        >
          شاهد السيرة كاملة ←
        </a>
      </div>
    </div>
  )
}
