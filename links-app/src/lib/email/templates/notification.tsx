import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface NotificationEmailProps {
  title: string
  message: string
  ctaLabel?: string
  ctaUrl?: string
}

export function NotificationEmail({
  title,
  message,
  ctaLabel,
  ctaUrl,
}: NotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: '#f5f7fa', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' }}>
            <Heading style={{ fontSize: '24px', color: '#333', marginBottom: '16px' }}>
              {title}
            </Heading>
            <Text style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {message}
            </Text>
            {ctaLabel && ctaUrl && (
              <Section style={{ textAlign: 'center', margin: '24px 0' }}>
                <Link
                  href={ctaUrl}
                  style={{
                    backgroundColor: '#2A7FD4',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  {ctaLabel}
                </Link>
              </Section>
            )}
            <Hr style={{ borderColor: '#eee', margin: '24px 0' }} />
            <Text style={{ fontSize: '12px', color: '#aaa' }}>
              Link&apos;s Accompagnement
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
