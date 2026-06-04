'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, BarChart2, Tag, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  spaceId: string
}

const NAV_ITEMS = [
  { label: 'ホーム',     href: '',          icon: Home },
  { label: '支出一覧',   href: '/expenses', icon: List },
  { label: '集計',       href: '/analytics', icon: BarChart2 },
  { label: 'イベント',   href: '/events',   icon: Tag },
  { label: '設定',       href: '/settings', icon: Settings },
]

export default function BottomNav({ spaceId }: BottomNavProps) {
  const pathname = usePathname()
  const base = `/${spaceId}`

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t bg-background">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const to = `${base}${href}`
        const isActive = href === '' ? pathname === base : pathname.startsWith(to)
        return (
          <Link
            key={href}
            href={to}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
