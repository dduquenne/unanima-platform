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

interface WelcomeEmailProps {
  userName: string
  loginUrl: string
  email: string
}

export function WelcomeEmail({ userName, loginUrl, email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur Link&apos;s Accompagnement</Preview>
      <Body style={{ backgroundColor: '#f5f7fa', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' }}>
            <Heading style={{ fontSize: '24px', color: '#333', marginBottom: '16px' }}>
              Bienvenue, {userName} !
            </Heading>
            <Text style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              Votre compte Link&apos;s Accompagnement a été créé avec succès.
            </Text>
            <Text style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              Votre identifiant : <strong>{email}</strong>
            </Text>
            <Section style={{ textAlign: 'center', margin: '24px 0' }}>
              <Link
                href={loginUrl}
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
                Se connecter
              </Link>
            </Section>
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
