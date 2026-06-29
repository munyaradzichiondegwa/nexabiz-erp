import numeral from 'numeral'

export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(value: number, format = '0,0.00'): string {
  return numeral(value).format(format)
}

export function parseCurrency(value: string): number {
  return numeral(value).value() ?? 0
}
