import { Download, ExternalLink, PencilLine, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import Toggle from '../../components/ui/Toggle'
import { getAdminUsers } from '../../services/api/authApi'
import { assignProfileOwner, getProfiles, updateProfileStatus } from '../../services/api/profileApi'
import { downloadImage } from '../../utils/download'
import { getAuthUser } from '../../utils/auth'

const PAGE_LIMIT = 10

function ProfilesPage() {
  const authUser = getAuthUser()
  const [profiles, setProfiles] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [confirmData, setConfirmData] = useState(null)
  const [assignTarget, setAssignTarget] = useState(null)
  const [adminUsers, setAdminUsers] = useState([])
  const [selectedOwnerId, setSelectedOwnerId] = useState('')
  const [assigningOwner, setAssigningOwner] = useState(false)
  const [assignMessage, setAssignMessage] = useState('')

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const response = await getProfiles({ search, status, page, limit: PAGE_LIMIT })
      const payload = response?.data || response
      const rows = payload?.items || payload?.profiles || payload || []

      setProfiles(Array.isArray(rows) ? rows : [])
      setMeta({
        page: payload?.page || page,
        totalPages: payload?.totalPages || payload?.total_pages || 1,
        total: payload?.total || rows.length || 0,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status])

  useEffect(() => {
    const loadAdmins = async () => {
      if (authUser?.role !== 'SUPER_ADMIN') return
      const response = await getAdminUsers()
      setAdminUsers(response?.items || response?.data?.items || [])
    }

    loadAdmins()
  }, [authUser?.role])

  const columns = useMemo(
    () => [
      { key: 'full_name', title: 'Full Name' },
      { key: 'username', title: 'Username' },
      { key: 'company_name', title: 'Company' },
      ...(authUser?.role === 'SUPER_ADMIN'
        ? [
            {
              key: 'owner_admin_id',
              title: 'Assigned Admin',
              render: (row) => {
                const assigned = adminUsers.find((admin) => (admin.id || admin._id) === row.owner_admin_id)
                if (!assigned) return <span className="text-xs text-slate-400">Unassigned</span>
                return (
                  <span className="text-xs font-medium text-slate-700">
                    {assigned.full_name}
                  </span>
                )
              },
            },
          ]
        : []),
      {
        key: 'status',
        title: 'Status',
        render: (row) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              row.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {row.status}
          </span>
        ),
      },
      { key: 'nfc_uid', title: 'NFC UID' },
      {
        key: 'created_at',
        title: 'Created',
        render: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'),
      },
      {
        key: 'actions',
        title: 'Actions',
        render: (row) => {
          const isActive = row.status === 'ACTIVE'

          return (
            <div className="flex min-w-[220px] flex-wrap gap-2">
              <a
                href={`/${row.username}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <ExternalLink size={14} /> View
              </a>
              <Link
                to={`/admin/profiles/${row.id}/edit`}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <PencilLine size={14} /> Edit
              </Link>
              <button
                type="button"
                disabled={!row.qr_image_url}
                onClick={() => downloadImage(row.qr_image_url, `${row.username}-qr.png`)}
                className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2 text-xs font-medium transition ${
                  row.qr_image_url
                    ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'cursor-not-allowed border-slate-200 text-slate-400'
                }`}
              >
                <Download size={14} /> QR
              </button>
              <Toggle
                checked={isActive}
                label="Toggle status"
                onChange={() =>
                  setConfirmData({
                    id: row.id,
                    targetStatus: isActive ? 'DISABLED' : 'ACTIVE',
                    label: row.full_name,
                  })
                }
              />
              {/* {authUser?.role === 'SUPER_ADMIN' ? (
                <button
                  type="button"
                  onClick={() => {
                    setAssignMessage('')
                    setAssignTarget(row)
                    setSelectedOwnerId(row.owner_admin_id || '')
                  }}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Assign Admin
                </button>
              ) : null} */}
            </div>
          )
        },
      },
    ],
    [adminUsers, authUser?.role],
  )

  const handleSearch = async (event) => {
    event.preventDefault()
    setPage(1)
    await fetchProfiles()
  }

  const handleConfirmStatus = async () => {
    if (!confirmData) return

    await updateProfileStatus(confirmData.id, confirmData.targetStatus)
    setConfirmData(null)
    await fetchProfiles()
  }

  const handleAssignOwner = async () => {
    if (!assignTarget) return
    setAssigningOwner(true)
    setAssignMessage('')
    try {
      await assignProfileOwner(assignTarget.id, selectedOwnerId || null)
      setAssignMessage('Profile assignment updated.')
      await fetchProfiles()
      setTimeout(() => {
        setAssignTarget(null)
        setAssignMessage('')
      }, 900)
    } catch (error) {
      setAssignMessage(error.response?.data?.message || 'Unable to assign profile')
    } finally {
      setAssigningOwner(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Profiles</h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{meta.total} total</span>
        </div>
        <form className="flex w-full flex-col gap-2 sm:flex-row" onSubmit={handleSearch}>
          <div className="w-full sm:max-w-sm">
            <Input
              placeholder="Search name, username, email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
            <Search size={16} className="-mt-7 ml-3 text-slate-400" />
          </div>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none ring-sky-300 focus:border-sky-500 focus:ring-2"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
          <Button type="submit">Apply</Button>
        </form>
        {authUser?.role === 'SUPER_ADMIN' ? (
          <div className="mt-3">
            <Link to="/admin/profiles/new">
              <Button>Create Profile</Button>
            </Link>
          </div>
        ) : null}
      </Card>

      <Table columns={columns} rows={profiles} rowKey={(row) => row.id} loading={loading} emptyText="No profiles found." />

      <Card className="flex items-center justify-between px-4 py-3 text-sm text-slate-600">
        <p>
          Page {meta.page} of {meta.totalPages} ({meta.total} records)
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </Button>
          <Button variant="secondary" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((value) => value + 1)}>
            Next
          </Button>
        </div>
      </Card>

      <Modal
        open={Boolean(confirmData)}
        title="Update profile status"
        description={
          confirmData
            ? `Change ${confirmData.label} to ${confirmData.targetStatus}? Contact visibility on the public profile depends on this status.`
            : ''
        }
        onClose={() => setConfirmData(null)}
        onConfirm={handleConfirmStatus}
        confirmText="Confirm"
      />

      <Modal
        open={Boolean(assignTarget)}
        title="Assign Admin User"
        description={assignTarget ? `Assign ${assignTarget.full_name} (${assignTarget.username}) to an admin user.` : ''}
        onClose={() => {
          setAssignTarget(null)
          setAssignMessage('')
        }}
        onConfirm={handleAssignOwner}
        confirmText={assigningOwner ? 'Saving...' : 'Save Assignment'}
      >
        <div className="space-y-3">
          <label className="flex w-full flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Admin User</span>
            <select
              value={selectedOwnerId}
              onChange={(event) => setSelectedOwnerId(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white/95 px-3 text-sm outline-none ring-blue-200 transition focus:border-blue-500 focus:ring-2"
            >
              <option value="">Unassigned</option>
              {adminUsers.map((admin) => (
                <option key={admin.id || admin._id} value={admin.id || admin._id}>
                  {admin.full_name} ({admin.email})
                </option>
              ))}
            </select>
          </label>
          {assignMessage ? <p className="text-sm text-blue-700">{assignMessage}</p> : null}
        </div>
      </Modal>
    </div>
  )
}

export default ProfilesPage
