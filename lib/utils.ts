export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function priorityLabel(score: number): string {
  if (score >= 80) return 'High'
  if (score >= 50) return 'Medium'
  return 'Low'
}

export function priorityColor(score: number): string {
  if (score >= 80) return '#E24B4A'
  if (score >= 50) return '#C8922A'
  return '#6B7280'
}

export function statusColors(status: string): { bg: string; color: string } {
  switch (status) {
    case 'new':      return { bg: '#EDE9FE', color: '#5B21B6' }
    case 'reviewed': return { bg: '#DBEAFE', color: '#1E40AF' }
    case 'quoted':   return { bg: '#FEF3C7', color: '#92400E' }
    case 'won':      return { bg: '#D1FAE5', color: '#065F46' }
    case 'lost':     return { bg: '#F3F4F6', color: '#6B7280' }
    default:         return { bg: '#F3F4F6', color: '#6B7280' }
  }
}
