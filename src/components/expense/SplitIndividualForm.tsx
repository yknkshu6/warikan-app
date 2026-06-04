import type { Member } from '@/types'
import { formatCurrency, parseAmountInput } from '@/lib/utils/currency'
import { Input } from '@/components/ui/input'

interface Props {
  amount: number
  activeMembers: Member[]
  amounts: Record<string, number>
  paidBy: string | null
  onChange: (amounts: Record<string, number>) => void
}

export default function SplitIndividualForm({ amount, activeMembers, amounts, paidBy, onChange }: Props) {
  const total = Object.values(amounts).reduce((s, v) => s + v, 0)
  const remainder = amount - total

  return (
    <div className="space-y-2">
      {activeMembers.map(member => (
        <div key={member.id} className="flex items-center gap-2">
          <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: member.color }} />
          <span className="flex-1 text-sm">{member.display_name}</span>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amounts[member.id] ? amounts[member.id].toLocaleString('ja-JP') : ''}
            onChange={e => onChange({ ...amounts, [member.id]: parseAmountInput(e.target.value) })}
            className="w-28 text-right"
          />
        </div>
      ))}
      {amount > 0 && (
        <div className={`text-xs pt-1 ${remainder < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
          合計 {formatCurrency(total)} / {formatCurrency(amount)}
          {remainder > 0 && paidBy && ` （端数 ${formatCurrency(remainder)} は立替者が負担）`}
          {remainder < 0 && ' — 合計が支出額を超えています'}
        </div>
      )}
    </div>
  )
}
