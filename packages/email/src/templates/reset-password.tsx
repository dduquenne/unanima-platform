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

interface ResetPasswordEmailProps {
  resetLink: string
  userName: string
  expirationHours?: number
  theme?: EmailTheme
}

export function ResetPasswordEmail({
  resetLink,
  userName,
  expirationHours = 24,
  theme = {},
}: ResetPasswordEmailProps) {
  const {
    primaryColor = '#1E6FC0',
    organizationName = 'Unanima',
  } = theme

  return (
    <Html>
      <Head />
      <Preview>Réinitialisation de votre mot de passe {organizationName}</Preview>
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
              Réinitialisation du mot de passe
            </Heading>
            <Text style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              Bonjour {userName},
            </Text>
            <Text style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien
              ci-dessous pour définir un nouveau mot de passe :
            </Text>
            <Section style={{ textAlign: 'center', margin: '24px 0' }}>
              <Link
                href={resetLink}
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
                Réinitialiser mon mot de passe
              </Link>
            </Section>
            <Text style={{ fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
              Ce lien expire dans {expirationHours} heures. Si vous n&apos;avez pas demandé cette
              réinitialisation, vous pouvez ignorer cet e-mail.
            </Text>
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
