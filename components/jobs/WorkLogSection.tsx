'use client'

import { useState, useEffect } from 'react'
import { fmtDate } from '@/lib/utils'

type WorkLogEntry = {
  id: string
  date: string
  note: string
}

interface Props {
  jobId: string
  initialNotes: string
}

export default function WorkLogSection({ jobId, initialNotes }: Props) {
  const [entries, setEntries] = useState<WorkLogEntry[]>([])
  const [newEntry, setNewEntry] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      const parsed = JSON.parse(initialNotes || '[]')
      if (Array.isArray(parsed)) setEntries(parsed)
    } catch {
      setEntries([])
    }
  }, [initialNotes])

  async function persistEntries(updated: WorkLogEntry[]) {
    setSaving(true)
    await fetch(`/api/admin/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internal_notes: JSON.stringify(updated) }),
    })
    setSaving(false)
  }

  async function handleAdd() {
    if (!newEntry.trim() || saving) return
    const entry: WorkLogEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      note: newEntry.trim(),
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    setNewEntry('')
    await persistEntries(updated)
  }

  async function handleDelete(id: string) {
    const updated = entries.filter((e) => e.id !== id)
    setEntries(updated)
    await persistEntries(updated)
  }

  return (
    <div>
      {/* Add entry form */}
      <div className="mb-5">
        <textarea
          rows={3}
          className="w-full font-body resize-none rounded-xl px-4 py-3"
          style={{ border: '1px solid #E5E7EB', fontSize: '14px', color: '#0D0D0D' }}
          placeholder="What was done this month? Updates, changes, improvements..."
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAdd}
            disabled={!newEntry.trim() || saving}
            className="font-body font-medium rounded-xl px-4 py-2 transition-opacity disabled:opacity-40"
            style={{ background: '#8B2FC9', color: 'white', fontSize: '14px' }}
          >
            Log Work
          </button>
        </div>
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <p
          className="font-body text-center py-4"
          style={{ color: '#9CA3AF', fontSize: '13px' }}
        >
          No work logged yet
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl p-4 relative"
              style={{ background: '#F9F9F9' }}
            >
              <div className="flex items-start justify-between mb-2">
                <span
                  className="font-body font-semibold"
                  style={{ color: '#8B2FC9', fontSize: '12px' }}
                >
                  {fmtDate(entry.date)}
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="font-body leading-none transition-colors"
                  style={{ color: '#D1D5DB', fontSize: '18px', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#E24B4A')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#D1D5DB')}
                  aria-label="Delete entry"
                >
                  ×
                </button>
              </div>
              <p
                className="font-body"
                style={{ color: '#4A4A4A', fontSize: '14px', lineHeight: '1.6' }}
              >
                {entry.note}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
