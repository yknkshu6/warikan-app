import type { Member } from '@/types'
import { formatCurrency } from '@/lib/utils/currency'
import { Input } from '@/components/ui/input'

interface Props {
  amount: number
  activeMembers: Member[]
  ratios: Record<string, number>
  onChange: (ratios: Record<string, number>) => void
}

export default function SplitRatioForm({ amount, activeMembers, ratios, onChange }: Props) {
  const totalRatio = activeMembers.reduce((s, m) => s + (ratios[m.id] ?? 1), 0)

  const calcShare = (memberId: string) => {
    if (totalRatio === 0 || amount === 0) return 0
    return Math.floor(amount * (ratios[memberId] ?? 1) / totalRatio)
  }

  return (
    <div className="space-y-2">
      {activeMembers.map(member => (
        <div key={member.id} className="flex items-center gap-2">
          <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: member.color }} />
          <span className="flex-1 text-sm">{member.display_name}</span>
          <Input
            type="number"
            min={0}
            value={ratios[member.id] ?? 1}
            onChange={e => onChange({ ...ratios, [member.id]: Number(e.target.value) || 0 })}
            className="w-16 text-center"
          />
          <span className="w-20 text-right text-sm font-medium">
            {amount > 0 ? formatCurrency(calcShare(member.id)) : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}
