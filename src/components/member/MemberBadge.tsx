import { cn } from '@/lib/utils'
import type { Member } from '@/types'

interface MemberBadgeProps {
  member: Member | null | undefined
  size?: 'sm' | 'md'
  showDeleted?: boolean
  className?: string
}

export default function MemberBadge({
  member,
  size = 'md',
  showDeleted = true,
  className,
}: MemberBadgeProps) {
  if (!member) return <span className="text-muted-foreground text-sm">—</span>

  const name = member.is_deleted && showDeleted
    ? `${member.display_name}（削除済み）`
    : member.display_name

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        size === 'sm' ? 'text-xs' : 'text-sm',
        member.is_deleted && 'text-muted-foreground line-through',
        className
      )}
    >
      <span
        className={cn(
          'rounded-full shrink-0',
          size === 'sm' ? 'size-2' : 'size-3'
        )}
        style={{ backgroundColor: member.color }}
      />
      {name}
    </span>
  )
}
