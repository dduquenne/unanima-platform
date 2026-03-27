'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Modal } from '@/components/ui'
import { Download, AlertTriangle, Shield } from 'lucide-react'
import Link from 'next/link'

export default function MesDonneesPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setError(null)

    try {
      const res = await fetch('/api/rgpd/export')
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error ?? 'Erreur lors de l\u2019export')
      }

      const { data } = await res.json()

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mes-donnees-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 4000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de l\u2019export',
      )
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      const res = await fetch('/api/rgpd/delete', { method: 'POST' })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error ?? 'Erreur lors de la suppression')
      }

      await signOut()
      router.push('/login')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la suppression',
      )
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          Mes données personnelles
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
          Conformément au RGPD, vous pouvez exercer vos droits sur vos données
          personnelles.
        </p>
      </div>

      {/* Info banner */}
      <div className="relative overflow-hidden rounded-[18px] border border-[#B8D6F5] bg-[var(--color-info-light)]">
        <div
          className="h-1 w-full"
          style={{
            background: 'linear-gradient(90deg, #2A7FD4 0%, #F28C5A 100%)',
          }}
        />
        <div className="flex items-center gap-3 px-6 py-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE]">
            <Shield className="h-4 w-4 text-[var(--color-primary)]" />
          </span>
          <p className="text-[13px] text-[#1E40AF]">
            Vos données sont hébergées en France et protégées conformément au
            Règlement Général sur la Protection des Données (RGPD).
          </p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Export section */}
      <div className="rounded-[18px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          Exporter mes données
        </h2>
        <div className="mt-3 border-t border-[var(--color-border-light)]" />
        <p className="mt-3 text-[13px] text-[var(--color-text-secondary)]">
          Téléchargez l&apos;ensemble de vos données personnelles au format JSON.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="mt-4 inline-flex items-center gap-2 rounded-[18px] bg-[var(--color-primary)] px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Export en cours...' : 'Exporter mes données'}
        </button>
        {exportSuccess && (
          <p className="mt-2 text-[11px] text-[var(--color-success)]">
            Fichier téléchargé avec succès.
          </p>
        )}
        <p className="mt-2 text-[11px] italic text-[var(--color-text-muted)]">
          Le fichier sera généré et téléchargé automatiquement.
        </p>
      </div>

      {/* Delete section (danger zone) */}
      <div className="rounded-[18px] border border-[#FECACA] bg-[#FFFAF8] p-6 shadow-[var(--shadow-lg)]">
        <h2 className="text-base font-semibold text-[#991B1B]">
          Supprimer mon compte
        </h2>
        <div className="mt-3 border-t border-[#FECACA]" />
        <p className="mt-3 text-[13px] text-[var(--color-text-secondary)]">
          Cette action est irréversible. Toutes vos données seront définitivement
          supprimées.
        </p>

        {/* Warning box */}
        <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-[#FECACA] bg-[var(--color-danger-light)] px-4 py-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-danger)]" />
          </span>
          <div className="text-xs text-[#991B1B]">
            <p>
              La suppression inclut : vos réponses aux questionnaires, vos
              documents, votre historique de séances.
            </p>
            <p className="mt-1">
              Délai légal de conservation : 3 ans après la fin du bilan.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-[18px] bg-[var(--color-danger)] px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-danger)]/90"
        >
          Demander la suppression
        </button>
        <p className="mt-2 text-[11px] italic text-[var(--color-text-muted)]">
          Une confirmation vous sera demandée. L&apos;administrateur sera notifié.
        </p>
      </div>

      {/* Historique des demandes */}
      <div className="rounded-[18px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          Historique des demandes
        </h2>
        <div className="mt-3 border-t border-[var(--color-border-light)]" />
        <p className="mt-4 text-center text-[13px] text-[var(--color-text-muted)]">
          Aucune demande de données en cours.
        </p>
      </div>

      {/* Legal links */}
      <div className="flex items-center gap-3 text-xs">
        <Link
          href="/confidentialite"
          className="font-medium text-[var(--color-primary)] underline"
        >
          Politique de confidentialité
        </Link>
        <span className="text-[var(--color-border)]">|</span>
        <Link
          href="/mentions-legales"
          className="font-medium text-[var(--color-primary)] underline"
        >
          Mentions légales
        </Link>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
        size="sm"
        actions={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-[var(--radius-md)] bg-[var(--color-danger)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-danger)]/90 disabled:opacity-50"
            >
              {deleting
                ? 'Suppression en cours...'
                : 'Confirmer la suppression'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-text)]">
            Êtes-vous absolument sûr de vouloir supprimer votre compte ?
          </p>
          <p className="text-sm font-medium text-[var(--color-danger)]">
            Cette action est irréversible. Toutes vos données seront
            définitivement supprimées, y compris vos réponses aux questionnaires
            et vos documents.
          </p>
        </div>
      </Modal>
    </div>
  )
}
