import type { Member } from '@/types'
import { formatCurrency } from '@/lib/utils/currency'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface Props {
  amount: number
  activeMembers: Member[]
  includedIds: string[]
  onChange: (ids: string[]) => void
}

export default function SplitEqualForm({ amount, activeMembers, includedIds, onChange }: Props) {
  const count = includedIds.length || 1
  const perPerson = Math.floor(amount / count)
  const remainder = amount - perPerson * count

  const toggle = (id: string) => {
    onChange(
      includedIds.includes(id)
        ? includedIds.filter(x => x !== id)
        : [...includedIds, id]
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {activeMembers.map(member => (
          <div key={member.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`equal-${member.id}`}
                checked={includedIds.includes(member.id)}
                onCheckedChange={() => toggle(member.id)}
              />
              <span className="size-3 rounded-full" style={{ backgroundColor: member.color }} />
              <Label htmlFor={`equal-${member.id}`} className="cursor-pointer">
                {member.display_name}
              </Label>
            </div>
            <span className="text-sm font-medium">
              {includedIds.includes(member.id) ? formatCurrency(perPerson) : '—'}
            </span>
          </div>
        ))}
      </div>
      {amount > 0 && includedIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {formatCurrency(perPerson)}/人
          {remainder > 0 && `（端数 ${formatCurrency(remainder)} は立替者が負担）`}
        </p>
      )}
    </div>
  )
}
