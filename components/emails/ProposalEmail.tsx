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
  Preview,
} from '@react-email/components'

interface LineItem {
  name: string
  description: string
  price: number
  is_retainer: boolean
}

interface ProposalEmailProps {
  customerName: string
  businessName: string
  intro: string
  lineItems: LineItem[]
  investmentLow: number
  investmentHigh: number
  monthlyRetainer: number
  timelineWeeks: number
  nextSteps: string
}

export default function ProposalEmail({
  customerName,
  intro,
  lineItems,
  investmentLow,
  investmentHigh,
  monthlyRetainer,
  timelineWeeks,
  nextSteps,
}: ProposalEmailProps) {
  const investmentDisplay =
    investmentLow === investmentHigh
      ? `$${investmentLow.toLocaleString()}`
      : `$${investmentLow.toLocaleString()} – $${investmentHigh.toLocaleString()}`

  return (
    <Html lang="en">
      <Head />
      <Preview>Your proposal from Honed Ops</Preview>
      <Body
        style={{
          backgroundColor: '#F5F5F5',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
          margin: '0',
          padding: '32px 16px',
        }}
      >
        <Container
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Section style={{ backgroundColor: '#0D0D0D', padding: '0' }}>
            <Row>
              <Column style={{ padding: '24px 32px' }}>
                <Img
                  src="https://honedops.com/honed666.png"
                  alt="Honed Ops"
                  width="120"
                  height="auto"
                  style={{ display: 'block' }}
                />
              </Column>
            </Row>
          </Section>

          {/* Purple accent bar */}
          <Section style={{ backgroundColor: '#8B2FC9', padding: '0', height: '4px' }} />

          {/* Body */}
          <Section style={{ padding: '36px 36px 28px' }}>
            <Text
              style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0D0D0D',
                margin: '0 0 16px',
              }}
            >
              Hi {customerName.split(' ')[0]},
            </Text>

            <Text
              style={{
                fontSize: '15px',
                color: '#4A4A4A',
                lineHeight: '1.7',
                margin: '0 0 28px',
              }}
            >
              {intro}
            </Text>

            <Text
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#8B2FC9',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '0 0 12px',
              }}
            >
              Scope of Work
            </Text>

            {lineItems.map((item, i) => (
              <Row
                key={i}
                style={{
                  borderBottom: '1px solid #F0F0F0',
                  paddingBottom: '12px',
                  marginBottom: '12px',
                }}
              >
                <Column>
                  <Text
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0D0D0D',
                      margin: '0 0 2px',
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: '13px',
                      color: '#6B7280',
                      margin: '0',
                      lineHeight: '1.5',
                    }}
                  >
                    {item.description}
                  </Text>
                </Column>
                <Column
                  style={{
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    paddingLeft: '16px',
                    verticalAlign: 'top',
                  }}
                >
                  <Text
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#8B2FC9',
                      margin: '0',
                    }}
                  >
                    {item.is_retainer
                      ? `$${item.price}/mo`
                      : item.price === 0
                        ? 'Free'
                        : `$${item.price.toLocaleString()}`}
                  </Text>
                </Column>
              </Row>
            ))}

            {/* Investment block */}
            <Section
              style={{
                backgroundColor: '#F9F9F9',
                borderRadius: '8px',
                padding: '16px 20px',
                margin: '20px 0',
              }}
            >
              <Row>
                <Column>
                  <Text style={{ fontSize: '13px', color: '#4A4A4A', margin: '0 0 4px' }}>
                    Total Investment
                  </Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#0D0D0D',
                      margin: '0',
                    }}
                  >
                    {investmentDisplay}
                  </Text>
                </Column>
              </Row>

              {monthlyRetainer > 0 && (
                <Row
                  style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid #E5E7EB',
                  }}
                >
                  <Column>
                    <Text style={{ fontSize: '13px', color: '#4A4A4A', margin: '0' }}>
                      Monthly Retainer
                    </Text>
                  </Column>
                  <Column style={{ textAlign: 'right' }}>
                    <Text
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#8B2FC9',
                        margin: '0',
                      }}
                    >
                      ${monthlyRetainer.toLocaleString()}/mo
                    </Text>
                  </Column>
                </Row>
              )}

              {timelineWeeks > 0 && (
                <Row
                  style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid #E5E7EB',
                  }}
                >
                  <Column>
                    <Text style={{ fontSize: '13px', color: '#4A4A4A', margin: '0' }}>
                      Estimated Timeline
                    </Text>
                  </Column>
                  <Column style={{ textAlign: 'right' }}>
                    <Text style={{ fontSize: '13px', color: '#4A4A4A', margin: '0' }}>
                      {timelineWeeks} weeks
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>

            <Hr style={{ borderColor: '#F0F0F0', margin: '24px 0' }} />

            <Text
              style={{
                fontSize: '14px',
                color: '#4A4A4A',
                lineHeight: '1.7',
                margin: '0 0 24px',
              }}
            >
              {nextSteps}
            </Text>

            <Text
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#0D0D0D',
                margin: '0 0 2px',
              }}
            >
              The Honed Ops Team
            </Text>
            <Text style={{ fontSize: '13px', color: '#6B7280', margin: '0' }}>
              contact@honedops.com
            </Text>
          </Section>

          {/* Footer */}
          <Section
            style={{
              backgroundColor: '#0D0D0D',
              padding: '20px 32px',
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                margin: '0',
              }}
            >
              Honed Ops · honedops.com · Operate With An Edge
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
