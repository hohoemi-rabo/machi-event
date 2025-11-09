export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(date)
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  }).format(date)
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function getWeekRange(): { start: Date; end: Date } {
  const today = new Date()
  const end = new Date(today)
  end.setDate(today.getDate() + 7)
  return { start: today, end }
}

export function getMonthRange(): { start: Date; end: Date } {
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return { start: today, end }
}
