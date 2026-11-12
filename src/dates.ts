export type Bucket = 'overdue' | 'today' | 'upcoming' | 'none'

export function toDateStr(d: Date) {
  return d.toLocaleDateString('en-CA')
}

export function dateInDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

export function bucketOf(due: string | null): Bucket {
  if (!due) return 'none'
  const today = dateInDays(0)
  if (due < today) return 'overdue'
  if (due === today) return 'today'
  return 'upcoming'
}

export function formatDue(due: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(`${due}T00:00:00`)
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000)

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1 && diff < 7) return date.toLocaleDateString(undefined, { weekday: 'long' })
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
