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

const THEME = {
  primaryColor: '#1E6FC0',
  organizationName: "Link's Accompagnement",
}

const baseStyle = {
  backgroundColor: '#f5f7fa',
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
}

const containerStyle = {
  maxWidth: '560px' as const,
  margin: '0 auto',
  padding: '40px 20px',
}

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '40px',
}

const headingStyle = {
  fontSize: '24px',
  color: '#333',
  marginBottom: '16px',
}

const textStyle = {
  fontSize: '14px',
  color: '#555',
  lineHeight: '1.6',
}

const ctaStyle = {
  backgroundColor: THEME.primaryColor,
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none' as const,
  fontSize: '14px',
  fontWeight: '600' as const,
}

// ---------------------------------------------------------------------------
// Nouveau bénéficiaire assigné → email au consultant
// ---------------------------------------------------------------------------

interface NewBeneficiaireEmailProps {
  consultantName: string
  beneficiaireName: string
  dashboardUrl: string
}

export function NewBeneficiaireEmail({
  consultantName,
  beneficiaireName,
  dashboardUrl,
}: NewBeneficiaireEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouveau bénéficiaire assigné : {beneficiaireName}</Preview>
      <Body style={baseStyle}>
        <Container style={containerStyle}>
          <Section style={cardStyle}>
            <Heading style={headingStyle}>Nouveau bénéficiaire</Heading>
            <Text style={textStyle}>
              Bonjour {consultantName},
            </Text>
            <Text style={textStyle}>
              Un nouveau bénéficiaire vous a été assigné : <strong>{beneficiaireName}</strong>.
            </Text>
            <Text style={textStyle}>
              Vous pouvez consulter son dossier depuis votre tableau de bord.
            </Text>
            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Link href={dashboardUrl} style={ctaStyle}>
                Voir le tableau de bord
              </Link>
            </Section>
            <Hr style={{ borderColor: '#eee', margin: '24px 0' }} />
            <Text style={{ fontSize: '12px', color: '#aaa' }}>
              {THEME.organizationName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ---------------------------------------------------------------------------
// Rappel de complétion → email au bénéficiaire
// ---------------------------------------------------------------------------

interface CompletionReminderEmailProps {
  beneficiaireName: string
  bilanType: string
  daysRemaining: number
  questionnaireUrl: string
}

export function CompletionReminderEmail({
  beneficiaireName,
  bilanType,
  daysRemaining,
  questionnaireUrl,
}: CompletionReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`Rappel : il vous reste ${daysRemaining} jour(s) pour compléter votre questionnaire`}
      </Preview>
      <Body style={baseStyle}>
        <Container style={containerStyle}>
          <Section style={cardStyle}>
            <Heading style={headingStyle}>Rappel de complétion</Heading>
            <Text style={textStyle}>
              Bonjour {beneficiaireName},
            </Text>
            <Text style={textStyle}>
              Votre bilan de compétences ({bilanType}) nécessite encore votre attention.
              Il vous reste <strong>{daysRemaining} jour(s)</strong> pour compléter votre questionnaire.
            </Text>
            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Link href={questionnaireUrl} style={ctaStyle}>
                Compléter le questionnaire
              </Link>
            </Section>
            <Hr style={{ borderColor: '#eee', margin: '24px 0' }} />
            <Text style={{ fontSize: '12px', color: '#aaa' }}>
              {THEME.organizationName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ---------------------------------------------------------------------------
// Fin de bilan → email récapitulatif
// ---------------------------------------------------------------------------

interface BilanCompleteEmailProps {
  recipientName: string
  beneficiaireName: string
  bilanType: string
  completedDate: string
  bilanUrl: string
}

export function BilanCompleteEmail({
  recipientName,
  beneficiaireName,
  bilanType,
  completedDate,
  bilanUrl,
}: BilanCompleteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bilan de compétences terminé — {beneficiaireName}</Preview>
      <Body style={baseStyle}>
        <Container style={containerStyle}>
          <Section style={cardStyle}>
            <Heading style={headingStyle}>Bilan terminé</Heading>
            <Text style={textStyle}>
              Bonjour {recipientName},
            </Text>
            <Text style={textStyle}>
              Le bilan de compétences ({bilanType}) de <strong>{beneficiaireName}</strong> a été
              terminé le {completedDate}.
            </Text>
            <Text style={textStyle}>
              Vous pouvez consulter le récapitulatif complet en cliquant sur le bouton ci-dessous.
            </Text>
            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Link href={bilanUrl} style={ctaStyle}>
                Voir le bilan
              </Link>
            </Section>
            <Hr style={{ borderColor: '#eee', margin: '24px 0' }} />
            <Text style={{ fontSize: '12px', color: '#aaa' }}>
              {THEME.organizationName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
