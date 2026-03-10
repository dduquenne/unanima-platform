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

interface EmailTheme {
  logoUrl?: string
  primaryColor?: string
  organizationName?: string
}

interface WelcomeEmailProps {
  userName: string
  loginUrl: string
  email: string
  theme?: EmailTheme
}

export function WelcomeEmail({
  userName,
  loginUrl,
  email,
  theme = {},
}: WelcomeEmailProps) {
  const {
    primaryColor = '#1E6FC0',
    organizationName = 'Unanima',
  } = theme

  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur {organizationName}</Preview>
      <Body style={{ backgroundColor: '#f5f7fa', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' }}>
            {theme.logoUrl && (
              <img
                src={theme.logoUrl}
                alt={organizationName}
                style={{ height: '40px', marginBottom: '24px' }}
              />
            )}
            <Heading style={{ fontSize: '24px', color: '#333', marginBottom: '16px' }}>
              Bienvenue, {userName} !
            </Heading>
            <Text style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              Votre compte {organizationName} a été créé avec succès.
            </Text>
            <Text style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              Votre identifiant : <strong>{email}</strong>
            </Text>
            <Section style={{ textAlign: 'center', margin: '24px 0' }}>
              <Link
                href={loginUrl}
                style={{
                  backgroundColor: primaryColor,
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Se connecter
              </Link>
            </Section>
            <Hr style={{ borderColor: '#eee', margin: '24px 0' }} />
            <Text style={{ fontSize: '12px', color: '#aaa' }}>
              {organizationName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
