'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@unanima/auth'
import { Card } from '@unanima/core'
import {
  Plus,
  Search,
  Pencil,
  Ban,
  RefreshCw,
  X,
  Check,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
  assigned_consultant?: {
    id: string
    full_name: string
  } | null
}

interface PaginatedResponse {
  data: UserProfile[]
  total: number
}

interface CreatedUser {
  email: string
  temporary_password: string
}

type ActiveTab = 'beneficiaire' | 'consultant'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2)
    return (
      (parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')
    ).toUpperCase()
  return fullName.slice(0, 2).toUpperCase()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PAGE_SIZE = 10

export default function AdminUtilisateursPage() {
  const { user: authUser } = useAuth()

  // ---- State ----
  const [activeTab, setActiveTab] = useState<ActiveTab>('beneficiaire')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [consultantFilter, setConsultantFilter] = useState<string>('all')

  const [users, setUsers] = useState<UserProfile[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [consultants, setConsultants] = useState<UserProfile[]>([])

  const [beneficiaireCount, setBeneficiaireCount] = useState(0)
  const [consultantCount, setConsultantCount] = useState(0)

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    assigned_consultant_id: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // After-creation modal
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null)
  const [copied, setCopied] = useState(false)

  // Edit modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [editFormData, setEditFormData] = useState({ full_name: '', consultant_id: '' })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Toasts
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Selected rows
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // ---- Helpers ----
  const showToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      setToast({ type, message })
      setTimeout(() => setToast(null), 4000)
    },
    [],
  )

  // ---- Data fetching ----
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        role: activeTab,
        page: String(page),
        limit: String(PAGE_SIZE),
      })
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (consultantFilter !== 'all')
        params.set('consultant_id', consultantFilter)

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs')
      const json: PaginatedResponse = await res.json()
      setUsers(json.data)
      setTotalUsers(json.total)
    } catch {
      showToast('error', 'Impossible de charger les utilisateurs.')
    } finally {
      setLoading(false)
    }
  }, [activeTab, page, searchQuery, statusFilter, consultantFilter, showToast])

  const fetchCounts = useCallback(async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        fetch('/api/admin/users?role=beneficiaire&limit=0&count=true'),
        fetch('/api/admin/users?role=consultant&limit=0&count=true'),
      ])
      if (bRes.ok) {
        const bJson = await bRes.json()
        setBeneficiaireCount(bJson.total ?? 0)
      }
      if (cRes.ok) {
        const cJson = await cRes.json()
        setConsultantCount(cJson.total ?? 0)
      }
    } catch {
      // silent
    }
  }, [])

  const fetchConsultants = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users?role=consultant&status=active&limit=200')
      if (!res.ok) return
      const json: PaginatedResponse = await res.json()
      setConsultants(json.data)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetchCounts()
    fetchConsultants()
  }, [fetchCounts, fetchConsultants])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
    setSelectedIds(new Set())
  }, [activeTab, searchQuery, statusFilter, consultantFilter])

  // ---- Handlers ----
  const handleToggleActive = async (user: UserProfile) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      })
      if (!res.ok) throw new Error()
      showToast(
        'success',
        user.is_active
          ? `${user.full_name} a été désactivé.`
          : `${user.full_name} a été réactivé.`,
      )
      fetchUsers()
      fetchCounts()
    } catch {
      showToast('error', 'Impossible de modifier le statut.')
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      setFormError('Veuillez remplir tous les champs obligatoires.')
      return
    }

    setFormSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
          email: formData.email.trim(),
          role: activeTab,
          consultant_id:
            activeTab === 'beneficiaire' && formData.assigned_consultant_id
              ? formData.assigned_consultant_id
              : null,
        }),
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null)
        throw new Error(errorJson?.error ?? 'Erreur lors de la création du compte.')
      }

      const json = await res.json()
      setCreatedUser(json.data as CreatedUser)
      setShowCreateModal(false)
      setFormData({ first_name: '', last_name: '', email: '', assigned_consultant_id: '' })
      showToast('success', 'Compte créé avec succès.')
      fetchUsers()
      fetchCounts()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleCopyCredentials = async () => {
    if (!createdUser) return
    const text = `Email : ${createdUser.email}\nMot de passe temporaire : ${createdUser.temporary_password}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      showToast('error', 'Impossible de copier dans le presse-papiers.')
    }
  }

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user)
    setEditFormData({
      full_name: user.full_name,
      consultant_id: user.assigned_consultant?.id ?? '',
    })
    setEditError(null)
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setEditSubmitting(true)
    setEditError(null)

    try {
      const body: Record<string, unknown> = {
        full_name: editFormData.full_name.trim(),
      }
      if (editingUser.role === 'beneficiaire') {
        body.consultant_id = editFormData.consultant_id || null
      }

      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null)
        throw new Error(errorJson?.error ?? 'Erreur lors de la modification.')
      }

      showToast('success', `${editFormData.full_name} mis à jour.`)
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setEditSubmitting(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)))
    }
  }

  // ---- Auth guard ----
  if (!authUser || authUser.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--color-text)] text-lg">
          Accès réservé aux administrateurs.
        </p>
      </div>
    )
  }

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE))

  // ---- Render ----
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-[var(--color-success)] text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Gestion des utilisateurs
          </h1>
          <p className="text-sm text-[var(--color-text)]/60 mt-1">
            Gérez les comptes bénéficiaires et consultantes de la plateforme
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ first_name: '', last_name: '', email: '', assigned_consultant_id: '' })
            setFormError(null)
            setShowCreateModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Créer un compte
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] mb-6">
        <button
          onClick={() => setActiveTab('beneficiaire')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'beneficiaire'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text)]/60 hover:text-[var(--color-text)]'
          }`}
        >
          Bénéficiaires
          <span
            className={`ml-2 inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-semibold ${
              activeTab === 'beneficiaire'
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {beneficiaireCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('consultant')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'consultant'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text)]/60 hover:text-[var(--color-text)]'
          }`}
        >
          Consultantes
          <span
            className={`ml-2 inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-semibold ${
              activeTab === 'consultant'
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {consultantCount}
          </span>
        </button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text)]/40" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text)]/40" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
              }
              className="appearance-none pl-10 pr-8 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>

          {/* Consultant filter (only on beneficiaire tab) */}
          {activeTab === 'beneficiaire' && (
            <select
              value={consultantFilter}
              onChange={(e) => setConsultantFilter(e.target.value)}
              className="appearance-none px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
            >
              <option value="all">Toutes les consultantes</option>
              {consultants.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-gray-50/80">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.size === users.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]/70 uppercase tracking-wider text-xs">
                  Nom
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]/70 uppercase tracking-wider text-xs">
                  Email
                </th>
                {activeTab === 'beneficiaire' && (
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]/70 uppercase tracking-wider text-xs">
                    Consultante assignée
                  </th>
                )}
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]/70 uppercase tracking-wider text-xs">
                  Statut
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]/70 uppercase tracking-wider text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td
                    colSpan={activeTab === 'beneficiaire' ? 6 : 5}
                    className="px-4 py-12 text-center text-[var(--color-text)]/50"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === 'beneficiaire' ? 6 : 5}
                    className="px-4 py-12 text-center text-[var(--color-text)]/50"
                  >
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      !user.is_active ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                    </td>

                    {/* Name + avatar + role + date */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
                            user.is_active
                              ? 'bg-[var(--color-primary)]'
                              : 'bg-gray-400'
                          }`}
                        >
                          {getInitials(user.full_name)}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              user.is_active
                                ? 'text-[var(--color-text)]'
                                : 'text-gray-400'
                            }`}
                          >
                            {user.full_name}
                          </p>
                          <p className="text-xs text-[var(--color-text)]/50">
                            {user.role === 'beneficiaire'
                              ? 'Bénéficiaire'
                              : 'Consultante'}{' '}
                            &middot; Inscrit le {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td
                      className={`px-4 py-3 ${
                        user.is_active
                          ? 'text-[var(--color-text)]'
                          : 'text-gray-400'
                      }`}
                    >
                      {user.email}
                    </td>

                    {/* Assigned consultant */}
                    {activeTab === 'beneficiaire' && (
                      <td className="px-4 py-3">
                        {user.assigned_consultant ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center text-[10px] font-semibold">
                              {getInitials(user.assigned_consultant.full_name)}
                            </div>
                            <span
                              className={
                                user.is_active
                                  ? 'text-[var(--color-text)]'
                                  : 'text-gray-400'
                              }
                            >
                              {user.assigned_consultant.full_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[var(--color-text)]/40">
                            Non assignée
                          </span>
                        )}
                      </td>
                    )}

                    {/* Status */}
                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-success)]/10 text-[var(--color-success)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Inactif
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Modifier"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Modifier
                        </button>
                        {user.is_active ? (
                          <button
                            onClick={() => handleToggleActive(user)}
                            title="Désactiver"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--color-warning)]/30 text-[var(--color-warning)] hover:bg-[var(--color-warning)]/5 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Désactiver
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(user)}
                            title="Réactiver"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--color-success)]/30 text-[var(--color-success)] hover:bg-[var(--color-success)]/5 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Réactiver
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text)]/50">
              {totalUsers} utilisateur{totalUsers > 1 ? 's' : ''} au total
              &middot; Page {page} sur {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-text)]/60 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 1 && p <= page + 1),
                )
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== undefined && p - (arr[idx - 1] as number) > 1) {
                    acc.push('ellipsis')
                  }
                  acc.push(p)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-[var(--color-text)]/30 text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`min-w-[2rem] h-8 rounded-md text-xs font-medium transition-colors ${
                        page === item
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'border border-[var(--color-border)] text-[var(--color-text)]/60 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-text)]/60 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ================================================================== */}
      {/* CREATE MODAL                                                       */}
      {/* ================================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header with blue accent */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--color-border)] relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)]" />
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {activeTab === 'beneficiaire'
                    ? 'Nouveau bénéficiaire'
                    : 'Nouvelle consultante'}
                </h2>
                <p className="text-xs text-[var(--color-text)]/50">
                  Remplissez les informations pour créer le compte
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute right-4 top-4 p-1 rounded-md hover:bg-gray-100 text-[var(--color-text)]/40 hover:text-[var(--color-text)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} className="px-6 py-5 space-y-4">
              {/* Prénom + Nom (side by side) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text)]/70 mb-1.5">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData((fd) => ({ ...fd, first_name: e.target.value }))
                    }
                    placeholder="Prénom"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text)]/70 mb-1.5">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData((fd) => ({ ...fd, last_name: e.target.value }))
                    }
                    placeholder="Nom"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-text)]/70 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/40 text-sm">
                    @
                  </span>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((fd) => ({ ...fd, email: e.target.value }))
                    }
                    placeholder="adresse@email.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              {/* Consultant assignment (only for beneficiaires) */}
              {activeTab === 'beneficiaire' && (
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text)]/70 mb-1.5">
                    Consultante assignée
                  </label>
                  <select
                    value={formData.assigned_consultant_id}
                    onChange={(e) =>
                      setFormData((fd) => ({
                        ...fd,
                        assigned_consultant_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  >
                    <option value="">Aucune consultante</option>
                    {consultants.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Info box */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
                <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[var(--color-primary)] text-xs font-bold">i</span>
                </div>
                <p className="text-xs text-[var(--color-text)]/70">
                  Un mot de passe temporaire sera généré automatiquement.
                  L&apos;utilisateur devra le modifier lors de sa première
                  connexion.
                </p>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {formSubmitting ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Création...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Créer le compte
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* AFTER-CREATION MODAL (credentials)                                 */}
      {/* ================================================================== */}
      {createdUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setCreatedUser(null)
              setCopied(false)
            }}
          />
          <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex flex-col items-center px-6 pt-8 pb-4">
              <div className="w-14 h-14 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mb-4">
                <Check className="w-7 h-7 text-[var(--color-success)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Compte créé avec succès
              </h2>
              <p className="text-sm text-[var(--color-text)]/50 mt-1 text-center">
                Voici les identifiants de connexion temporaires
              </p>
            </div>

            {/* Credentials */}
            <div className="mx-6 p-4 rounded-lg bg-gray-50 border border-[var(--color-border)] space-y-3">
              <div>
                <p className="text-xs font-medium text-[var(--color-text)]/50 mb-1">
                  Email
                </p>
                <p className="text-sm font-mono text-[var(--color-text)]">
                  {createdUser.email}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-text)]/50 mb-1">
                  Mot de passe temporaire
                </p>
                <p className="text-sm font-mono text-[var(--color-text)]">
                  {createdUser.temporary_password}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 px-6 py-6">
              <button
                onClick={handleCopyCredentials}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  copied
                    ? 'bg-[var(--color-success)] text-white'
                    : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Identifiants copiés !
                  </>
                ) : (
                  'Copier les identifiants'
                )}
              </button>
              <button
                onClick={() => {
                  setCreatedUser(null)
                  setCopied(false)
                }}
                className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* EDIT MODAL                                                         */}
      {/* ================================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditingUser(null)}
          />
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--color-border)] relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)]" />
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                <Pencil className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  Modifier {editingUser.full_name}
                </h2>
                <p className="text-xs text-[var(--color-text)]/50">
                  {editingUser.role === 'beneficiaire' ? 'Bénéficiaire' : 'Consultante'}
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="absolute right-4 top-4 p-1 rounded-md hover:bg-gray-100 text-[var(--color-text)]/40 hover:text-[var(--color-text)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text)]/70 mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.full_name}
                  onChange={(e) =>
                    setEditFormData((fd) => ({ ...fd, full_name: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                />
              </div>

              {editingUser.role === 'beneficiaire' && (
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text)]/70 mb-1.5">
                    Consultante assignée
                  </label>
                  <select
                    value={editFormData.consultant_id}
                    onChange={(e) =>
                      setEditFormData((fd) => ({ ...fd, consultant_id: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  >
                    <option value="">Aucune consultante</option>
                    {consultants
                      .filter((c) => c.is_active)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name}
                        </option>
                      ))}
                  </select>
                  <p className="mt-1.5 text-xs text-[var(--color-text)]/50">
                    La réassignation prend effet immédiatement : l&apos;ancienne consultante perd l&apos;accès au dossier.
                  </p>
                </div>
              )}

              {editError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
