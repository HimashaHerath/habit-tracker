export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(dateStr: string, delta: number): string {
  const date = parseLocalDate(dateStr)
  date.setDate(date.getDate() + delta)
  return formatLocalDate(date)
}

export function getDayOfWeek(dateStr: string): number {
  return parseLocalDate(dateStr).getDay()
}
