'use client'

import { useState } from 'react'
import { Copy, ExternalLink, ChevronDown, ChevronUp, Check } from 'lucide-react'

interface Props {
  tenant: {
    primary_color: string
    cta_text: string | null
  }
  assessmentUrl: string
}

const PLATFORMS = [
  {
    key: 'wix',
    label: 'Wix',
    steps: [
      'Open your Wix Editor and navigate to the page where you want the button.',
      'Click Add (+) → Embed Code → Embed HTML.',
      'Paste the embed code into the HTML box.',
      'Click Apply, then Publish.',
    ],
  },
  {
    key: 'squarespace',
    label: 'Squarespace',
    steps: [
      'Edit the page where you want the button.',
      'Click the block inserter (+) and select Code.',
      'Paste the embed code and click Apply.',
      'Save and publish the page.',
    ],
  },
  {
    key: 'wordpress',
    label: 'WordPress',
    steps: [
      'Edit the page or post in the block editor.',
      'Click the (+) block inserter and add a Custom HTML block.',
      'Paste the embed code into the block.',
      'Update or Publish the page.',
    ],
  },
  {
    key: 'godaddy',
    label: 'GoDaddy',
    steps: [
      'Open your GoDaddy Website Builder and edit the page.',
      'Click Add Section → HTML Code.',
      'Paste the embed code into the HTML editor.',
      'Save and publish your site.',
    ],
  },
  {
    key: 'custom',
    label: 'Other / Custom',
    steps: [
      'Copy the HTML snippet above.',
      'Open your page\'s HTML file in a code editor.',
      'Paste it inside the <body> tag wherever you want the button to appear.',
      'Save and deploy.',
    ],
  },
]

const sectionLabel: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  color: '#9CA3AF',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '16px',
}

const subLabel: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  color: '#4A4A4A',
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '8px',
}

export default function TenantShareSection({ tenant, assessmentUrl }: Props) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)
  const [openPlatform, setOpenPlatform] = useState<string | null>(null)

  const ctaText = tenant.cta_text || 'Get a Free Estimate'
  const embedCode = `<a href="${assessmentUrl}" style="display:inline-block;background-color:${tenant.primary_color};color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">${ctaText}</a>`

  function copyLink() {
    navigator.clipboard.writeText(assessmentUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function copyEmbed() {
    navigator.clipboard.writeText(embedCode)
    setCopiedEmbed(true)
    setTimeout(() => setCopiedEmbed(false), 2000)
  }

  return (
    <div
      className="rounded-2xl border p-5 mb-4 shadow-sm"
      style={{ background: 'white', borderColor: '#E5E7EB' }}
    >
      <p style={sectionLabel}>Share</p>

      {/* Direct Link */}
      <div style={{ marginBottom: '20px' }}>
        <p style={subLabel}>Direct Link</p>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: '#F9F9F9', border: '1px solid #E5E7EB' }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#4A4A4A',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {assessmentUrl}
          </span>
          <button
            onClick={copyLink}
            title="Copy link"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              color: copiedLink ? '#16A34A' : '#9CA3AF',
              flexShrink: 0,
            }}
          >
            {copiedLink ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <a
            href={assessmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open link"
            style={{ display: 'flex', color: '#9CA3AF', flexShrink: 0 }}
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Button Preview */}
      <div style={{ marginBottom: '20px' }}>
        <p style={subLabel}>Button Preview</p>
        <div
          className="flex items-center justify-center rounded-xl p-6"
          style={{ background: '#F9F9F9', border: '1px solid #E5E7EB' }}
        >
          <a
            href={assessmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: tenant.primary_color,
              color: '#ffffff',
              fontFamily: 'sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              padding: '14px 28px',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            {ctaText}
          </a>
        </div>
      </div>

      {/* Embed Code */}
      <div style={{ marginBottom: '20px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
          <p style={{ ...subLabel, marginBottom: 0 }}>Embed Code</p>
          <button
            onClick={copyEmbed}
            className="flex items-center gap-1.5"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: copiedEmbed ? '#16A34A' : '#8B2FC9',
            }}
          >
            {copiedEmbed ? <Check size={13} /> : <Copy size={13} />}
            {copiedEmbed ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre
          style={{
            background: '#0D0D0D',
            color: '#E5E7EB',
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '14px',
            borderRadius: '12px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            margin: 0,
          }}
        >
          {embedCode}
        </pre>
      </div>

      {/* Platform Guides */}
      <div>
        <p style={subLabel}>Platform Guides</p>
        <div
          style={{
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {PLATFORMS.map((platform, i) => {
            const isOpen = openPlatform === platform.key
            return (
              <div
                key={platform.key}
                style={{ borderTop: i === 0 ? 'none' : '1px solid #E5E7EB' }}
              >
                <button
                  onClick={() => setOpenPlatform(isOpen ? null : platform.key)}
                  className="flex items-center justify-between w-full"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#0D0D0D',
                    }}
                  >
                    {platform.label}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                  )}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 14px' }}>
                    <ol style={{ margin: 0, paddingLeft: '20px' }}>
                      {platform.steps.map((step, j) => (
                        <li
                          key={j}
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '13px',
                            color: '#4A4A4A',
                            lineHeight: '1.6',
                            marginBottom: j < platform.steps.length - 1 ? '4px' : 0,
                          }}
                        >
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
