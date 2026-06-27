'use client'
import { useEffect, useState } from 'react'

const activitiesByLocale = {
  ar: [
    { initial: 'ف', name: 'فهد العتيبي', action: 'أنشأ سيرته الذاتية', time: 'منذ ٥ دقائق', color: 'bg-green-mid' },
    { initial: 'س', name: 'سارة الرشيدي', action: 'نشرت بورتفوليوها', time: 'منذ ١٢ دقيقة', color: 'bg-gold' },
    { initial: 'ع', name: 'عبدالرحمن', action: 'حمّل سيرته PDF', time: 'منذ ٢٠ دقيقة', color: 'bg-ink-80' },
    { initial: 'ن', name: 'نورة السالم', action: 'أنشأت سيرتها', time: 'منذ ٣١ دقيقة', color: 'bg-gold' },
    { initial: 'م', name: 'محمد القحطاني', action: 'نشر بورتفوليوه', time: 'منذ ٤٥ دقيقة', color: 'bg-green-mid' },
  ],
  en: [
    { initial: 'F', name: 'Fahad Al-Otaibi', action: 'created their CV', time: '5 min ago', color: 'bg-green-mid' },
    { initial: 'S', name: 'Sarah Williams', action: 'published their portfolio', time: '12 min ago', color: 'bg-gold' },
    { initial: 'A', name: 'Abdulrahman', action: 'downloaded their PDF', time: '20 min ago', color: 'bg-ink-80' },
    { initial: 'N', name: 'Noura Al-Salem', action: 'created their CV', time: '31 min ago', color: 'bg-gold' },
    { initial: 'M', name: 'Michael Chen', action: 'published their portfolio', time: '45 min ago', color: 'bg-green-mid' },
  ],
}

export default function SocialProofStrip({ locale = 'ar' }: { locale?: string }) {
  const isRTL = locale === 'ar'
  const activities = isRTL ? activitiesByLocale.ar : activitiesByLocale.en
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % activities.length)
        setVisible(true)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [activities.length])

  const current = activities[index]
  const align = isRTL ? 'text-right' : 'text-left'

  return (
    <div className="flex items-center gap-3 bg-white border border-ink-10 rounded-2xl px-4 py-3.5 shadow-sm">
      <div className="flex -space-x-2 flex-shrink-0">
        {activities.slice(0, 3).map((a, i) => (
          <div key={i} className={`w-9 h-9 rounded-full ${a.color} flex items-center justify-center text-xs font-bold text-white border-2 border-white`}>
            {a.initial}
          </div>
        ))}
      </div>
      <div className={`transition-all duration-300 flex-1 min-w-0 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <p className={`text-sm text-ink font-semibold truncate ${align}`}>
          <span className="text-green-mid">{current.name}</span> {current.action}
        </p>
        <p className={`text-xs text-ink-30 ${align}`}>{current.time}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="w-2 h-2 bg-green-bright rounded-full animate-pulse shadow-[0_0_8px_2px_rgba(45,192,114,0.7)]" />
        <span className="text-xs text-green-mid font-bold">{isRTL ? 'مباشر' : 'Live'}</span>
      </div>
    </div>
  )
}
