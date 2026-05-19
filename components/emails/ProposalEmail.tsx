import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Hr,
  Link,
} from '@react-email/components'

interface LineItem {
  name: string
  price: number
  is_retainer: boolean
}

interface ProposalEmailProps {
  customerName: string
  businessName: string
  tier: string
  intro: string
  nextSteps: string
  lineItems: LineItem[]
  investmentLow: number
  investmentHigh: number
  monthlyRetainer: number
  timelineWeeks: number | null
}

const purple = '#8B2FC9'
const dark = '#0D0D0D'
const muted = '#6B7280'
const border = '#E5E7EB'
const bg = '#F9FAFB'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function ProposalEmail({
  customerName,
  businessName,
  tier,
  intro,
  nextSteps,
  lineItems,
  investmentLow,
  investmentHigh,
  monthlyRetainer,
  timelineWeeks,
}: ProposalEmailProps) {
  const oneTimeItems = lineItems.filter((li) => !li.is_retainer)
  const retainerItems = lineItems.filter((li) => li.is_retainer)
  const hasLineItems = lineItems.length > 0

  const investmentDisplay =
    investmentLow === investmentHigh
      ? formatCurrency(investmentLow)
      : `${formatCurrency(investmentLow)} – ${formatCurrency(investmentHigh)}`

  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1)

  return (
    <Html lang="en">
      <Head />
      <Body style={{ backgroundColor: bg, fontFamily: "'Inter', -apple-system, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '600px', margin: '40px auto', backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${border}` }}>

          {/* Header */}
          <Section style={{ backgroundColor: dark, padding: '28px 40px' }}>
            <Row>
              <Column>
                <Img
                  src="https://cebs-admin.vercel.app/images/cebslogo6-transparent.png"
                  alt="Competitive Edge Business Solutions"
                  height="40"
                  style={{ display: 'block' }}
                />
              </Column>
              <Column align="right">
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                  {tierLabel} Proposal
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Purple accent bar */}
          <Section style={{ backgroundColor: purple, padding: '3px 0' }} />

          {/* Body */}
          <Section style={{ padding: '36px 40px 24px' }}>
            <Text style={{ fontSize: '15px', color: dark, lineHeight: '1.6', margin: '0 0 20px', fontFamily: "'Inter', sans-serif" }}>
              Hi {customerName},
            </Text>
            <Text style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', margin: '0 0 28px', fontFamily: "'Inter', sans-serif" }}>
              {intro}
            </Text>
          </Section>

          <Hr style={{ borderColor: border, margin: '0 40px' }} />

          {/* Services / Investment */}
          <Section style={{ padding: '28px 40px' }}>
            <Text style={{ fontSize: '11px', color: muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px', fontFamily: "'Inter', sans-serif" }}>
              {hasLineItems ? 'Services Proposed' : `${tierLabel} Engagement`}
            </Text>

            {hasLineItems ? (
              <>
                {oneTimeItems.map((item, i) => (
                  <Row key={i} style={{ marginBottom: '12px' }}>
                    <Column>
                      <Text style={{ fontSize: '14px', color: dark, margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: '500' }}>
                        {item.name}
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text style={{ fontSize: '14px', color: dark, margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: '600' }}>
                        {item.price === 0 ? 'Free' : formatCurrency(item.price)}
                      </Text>
                    </Column>
                  </Row>
                ))}

                {retainerItems.map((item, i) => (
                  <Row key={i} style={{ marginBottom: '12px' }}>
                    <Column>
                      <Text style={{ fontSize: '14px', color: dark, margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: '500' }}>
                        {item.name}
                        <span style={{ color: muted, fontWeight: '400' }}> (monthly)</span>
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text style={{ fontSize: '14px', color: purple, margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: '600' }}>
                        {formatCurrency(item.price)}/mo
                      </Text>
                    </Column>
                  </Row>
                ))}
              </>
            ) : (
              <Row style={{ marginBottom: '12px' }}>
                <Column>
                  <Text style={{ fontSize: '14px', color: dark, margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: '500' }}>
                    {tierLabel} engagement — {businessName}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ fontSize: '14px', color: dark, margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: '600' }}>
                    {investmentDisplay}
                  </Text>
                </Column>
              </Row>
            )}

            {/* Total row */}
            <Hr style={{ borderColor: border, margin: '16px 0' }} />
            <Row>
              <Column>
                <Text style={{ fontSize: '13px', color: muted, margin: 0, fontFamily: "'Inter', sans-serif" }}>
                  Total Investment
                </Text>
              </Column>
              <Column align="right">
                <Text style={{ fontSize: '18px', color: dark, margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: '700' }}>
                  {investmentLow > 0 ? investmentDisplay : '—'}
                </Text>
                {monthlyRetainer > 0 && (
                  <Text style={{ fontSize: '13px', color: purple, margin: '2px 0 0', fontFamily: "'Inter', sans-serif", fontWeight: '600' }}>
                    + {formatCurrency(monthlyRetainer)}/mo retainer
                  </Text>
                )}
              </Column>
            </Row>

            {timelineWeeks && timelineWeeks > 0 ? (
              <Text style={{ fontSize: '13px', color: muted, margin: '16px 0 0', fontFamily: "'Inter', sans-serif" }}>
                Estimated timeline: {timelineWeeks} week{timelineWeeks !== 1 ? 's' : ''}
              </Text>
            ) : null}
          </Section>

          <Hr style={{ borderColor: border, margin: '0 40px' }} />

          {/* Next steps */}
          <Section style={{ padding: '28px 40px' }}>
            <Text style={{ fontSize: '11px', color: muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px', fontFamily: "'Inter', sans-serif" }}>
              Next Steps
            </Text>
            <Text style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', margin: 0, fontFamily: "'Inter', sans-serif" }}>
              {nextSteps}
            </Text>
          </Section>

          <Hr style={{ borderColor: border, margin: '0 40px' }} />

          {/* Footer */}
          <Section style={{ padding: '24px 40px 32px' }}>
            <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px', fontFamily: "'Inter', sans-serif" }}>
              Looking forward to working with you,
            </Text>
            <Text style={{ fontSize: '14px', color: dark, fontWeight: '600', margin: '0 0 4px', fontFamily: "'Inter', sans-serif" }}>
              The Competitive Edge Team
            </Text>
            <Link
              href="https://cuttingedgebs.com"
              style={{ fontSize: '13px', color: purple, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
            >
              cuttingedgebs.com
            </Link>
          </Section>

          {/* Bottom bar */}
          <Section style={{ backgroundColor: '#F9F9F9', padding: '14px 40px', borderTop: `1px solid ${border}` }}>
            <Text style={{ fontSize: '11px', color: '#9CA3AF', margin: 0, fontFamily: "'Inter', sans-serif" }}>
              Competitive Edge Business Solutions · This proposal is confidential and intended solely for {businessName}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
