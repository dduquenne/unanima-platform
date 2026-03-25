import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#333333',
  },
  header: {
    marginBottom: 24,
    borderBottom: '2px solid #1E6FC0',
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#0D3B6E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  sessionCard: {
    marginBottom: 16,
    border: '1px solid #DCE1EB',
    borderRadius: 4,
  },
  sessionHeader: {
    backgroundColor: '#F5F7FA',
    padding: 10,
    borderBottom: '1px solid #DCE1EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0D3B6E',
  },
  sessionDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  sessionContent: {
    padding: 12,
    fontSize: 10,
    lineHeight: 1.6,
    color: '#4A4A4A',
  },
  emptyContent: {
    padding: 12,
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'Helvetica-Oblique',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #DCE1EB',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  confidential: {
    fontSize: 8,
    color: '#DC3545',
    fontFamily: 'Helvetica-Bold',
  },
})

interface SessionEntry {
  session_number: number
  scheduled_at: string | null
  content: string | null
  updated_at: string | null
}

interface SessionNotesPDFProps {
  beneficiaryName: string
  consultantName: string
  exportDate: string
  sessions: SessionEntry[]
}

function formatDateFR(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function SessionNotesPDF({
  beneficiaryName,
  consultantName,
  exportDate,
  sessions,
}: SessionNotesPDFProps): React.JSX.Element {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Comptes-rendus de séances</Text>
          <Text style={styles.subtitle}>
            Bénéficiaire : {beneficiaryName}
          </Text>
          <Text style={styles.subtitle}>
            Consultante : {consultantName}
          </Text>
          <Text style={styles.subtitle}>
            Date d&apos;export : {exportDate}
          </Text>
        </View>

        {/* Session cards */}
        {sessions.map((session) => (
          <View
            key={session.session_number}
            style={styles.sessionCard}
            wrap={false}
          >
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTitle}>
                Séance {session.session_number}
              </Text>
              <Text style={styles.sessionDate}>
                {session.scheduled_at
                  ? formatDateFR(session.scheduled_at)
                  : 'Non planifiée'}
              </Text>
            </View>
            {session.content ? (
              <Text style={styles.sessionContent}>{session.content}</Text>
            ) : (
              <Text style={styles.emptyContent}>
                Séance {session.session_number} : compte-rendu non saisi
              </Text>
            )}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.confidential}>
            CONFIDENTIEL — Usage strictement réservé au consultant
          </Text>
          <Text style={styles.footerText}>
            Link&apos;s Accompagnement — {exportDate}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
