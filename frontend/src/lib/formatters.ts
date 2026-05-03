export function formatCurrency(value: number): string {
  return `${value.toFixed(2)} zł`
}

export function formatDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('pl-PL')
}