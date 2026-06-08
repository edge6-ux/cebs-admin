interface Pipeline {
  total: number
  new: number
  contacted: number
}

interface Props {
  pipeline: Pipeline
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  color: '#9CA3AF',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '16px',
}

export default function TenantPipelineStats({ pipeline }: Props) {
  const contactRate =
    pipeline.total > 0
      ? Math.round((pipeline.contacted / pipeline.total) * 100)
      : 0

  return (
    <div
      className="rounded-2xl border p-6 mb-4 shadow-sm"
      style={{ background: 'white', borderColor: '#E5E7EB' }}
    >
      <p style={sectionLabel}>Lead Pipeline</p>

      <div className="grid grid-cols-3 gap-4">
        {/* Total */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <p
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#0D0D0D',
              fontWeight: 700,
              fontSize: '28px',
              margin: 0,
            }}
          >
            {pipeline.total}
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#6B7280',
              fontSize: '12px',
              marginTop: '4px',
            }}
          >
            Total Leads
          </p>
        </div>

        {/* New */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <p
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: pipeline.new > 0 ? '#E24B4A' : '#0D0D0D',
              fontWeight: 700,
              fontSize: '28px',
              margin: 0,
            }}
          >
            {pipeline.new}
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#6B7280',
              fontSize: '12px',
              marginTop: '4px',
            }}
          >
            New
          </p>
          {pipeline.new > 0 && (
            <div
              className="animate-pulse rounded-full mx-auto"
              style={{
                width: '6px',
                height: '6px',
                background: '#E24B4A',
                marginTop: '8px',
              }}
            />
          )}
        </div>

        {/* Contacted */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <p
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#16A34A',
              fontWeight: 700,
              fontSize: '28px',
              margin: 0,
            }}
          >
            {pipeline.contacted}
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#6B7280',
              fontSize: '12px',
              marginTop: '4px',
            }}
          >
            Contacted
          </p>
        </div>
      </div>

      {/* Conversion rate */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #F5F5F5',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#6B7280',
              fontSize: '13px',
            }}
          >
            Contact Rate
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#0D0D0D',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {pipeline.total > 0 ? `${contactRate}%` : '—'}
          </span>
        </div>

        <div
          className="rounded-full"
          style={{
            height: '6px',
            background: '#F3F4F6',
            marginTop: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            className="rounded-full h-full"
            style={{
              background: '#8B2FC9',
              width: `${contactRate}%`,
              transition: 'width 500ms',
            }}
          />
        </div>
      </div>
    </div>
  )
}
