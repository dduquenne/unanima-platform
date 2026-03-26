'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@unanima/auth'
import { Button, Card } from '@unanima/core'

export default function MesDonneesPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/rgpd/export')
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error ?? 'Erreur lors de l\u2019export')
      }

      const { data } = await res.json()

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mes-donnees-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)

      setMessage('Vos données ont été exportées avec succès.')
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

      // Sign out and redirect
      await signOut()
      router.push('/login')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--color-text)]">
        Mes données personnelles
      </h2>

      {error && (
        <Card padding="md">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        </Card>
      )}

      {message && (
        <Card padding="md">
          <p className="text-sm text-[var(--color-success)]">{message}</p>
        </Card>
      )}

      {/* Export section */}
      <Card padding="lg">
        <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
          Exporter mes données
        </h3>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          Conformément au RGPD (droit à la portabilité), vous pouvez
          télécharger l{"'"}ensemble de vos données personnelles au format
          JSON.
        </p>
        <Button
          variant="primary"
          size="md"
          loading={exporting}
          onClick={handleExport}
        >
          Exporter mes données
        </Button>
      </Card>

      {/* Delete section */}
      <Card padding="lg">
        <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
          Supprimer mon compte
        </h3>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          Conformément au RGPD (droit à l{"'"}effacement), vous pouvez
          demander la suppression définitive de votre compte et de toutes vos
          données. Cette action est irréversible.
        </p>

        {!confirmDelete ? (
          <Button
            variant="danger"
            size="md"
            onClick={() => setConfirmDelete(true)}
          >
            Demander la suppression
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--color-danger)]">
              Êtes-vous sûr ? Toutes vos données seront définitivement
              supprimées.
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                size="md"
                loading={deleting}
                onClick={handleDelete}
              >
                Confirmer la suppression
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setConfirmDelete(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
