'use client'
import { useEffect, useState } from 'react'

const activities = [
  { initial: 'ف', name: 'فهد العتيبي', action: 'أنشأ سيرته الذاتية', time: 'منذ ٥ دقائق', color: 'bg-green-mid' },
  { initial: 'س', name: 'سارة الرشيدي', action: 'نشرت بورتفوليوها', time: 'منذ ١٢ دقيقة', color: 'bg-gold' },
  { initial: 'ع', name: 'عبدالرحمن', action: 'حمّل سيرته PDF', time: 'منذ ٢٠ دقيقة', color: 'bg-ink-80' },
  { initial: 'ن', name: 'نورة السالم', action: 'أنشأت سيرتها', time: 'منذ ٣١ دقيقة', color: 'bg-gold' },
  { initial: 'م', name: 'محمد القحطاني', action: 'نشر بورتفوليوه', time: 'منذ ٤٥ دقيقة', color: 'bg-green-mid' },
]

export default function SocialProofStrip() {
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
  }, [])

  const current = activities[index]

  return (
    <div className="flex items-center gap-3 bg-white border border-ink-10 rounded-2xl px-4 py-3 shadow-sm mb-5">
      <div className="flex -space-x-1.5 flex-shrink-0">
        {activities.slice(0, 3).map((a, i) => (
          <div key={i} className={`w-6 h-6 rounded-full ${a.color} flex items-center justify-center text-[9px] font-bold text-white border-2 border-white`}>
            {a.initial}
          </div>
        ))}
      </div>
      <div className={`transition-all duration-300 flex-1 min-w-0 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-xs text-ink font-semibold truncate text-right">
          <span className="text-green-mid">{current.name}</span> {current.action}
        </p>
        <p className="text-[10px] text-ink-30 text-right">{current.time}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="w-1.5 h-1.5 bg-green-bright rounded-full animate-pulse" />
        <span className="text-[10px] text-green-mid font-bold">مباشر</span>
      </div>
    </div>
  )
}
