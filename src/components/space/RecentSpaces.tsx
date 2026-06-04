'use client'

import Link from 'next/link'
import { useSessionStore } from '@/stores/sessionStore'
import { formatDate } from '@/lib/utils/date'
import { parseISO } from 'date-fns'

export default function RecentSpaces() {
  const { recently_visited } = useSessionStore()

  if (recently_visited.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">最近のスペース</p>
      <div className="space-y-2">
        {recently_visited.slice(0, 5).map(item => (
          <Link
            key={item.space_id}
            href={`/${item.space_id}`}
            className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
          >
            <span className="font-medium">{item.space_name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(parseISO(item.visited_at), 'M/d')}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
