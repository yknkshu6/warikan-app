export function formatCurrency(amount: number, currency = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function parseAmountInput(input: string): number {
  const cleaned = input.replace(/,/g, '').replace(/¥/g, '').trim()
  const num = Number(cleaned)
  return isNaN(num) ? 0 : Math.max(0, num)
}

export function formatAmountInput(amount: number): string {
  return amount === 0 ? '' : amount.toLocaleString('ja-JP')
}
