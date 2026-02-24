import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, PencilLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import Toggle from '../../components/ui/Toggle'
import { createAdminUser, getAdminUsers, resetAdminUserPassword, updateAdminUser, updateAdminUserStatus } from '../../services/api/authApi'
import { getAuthUser } from '../../utils/auth'

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().optional(),
  profile_image_url: z.string().optional(),
  status: z.enum(['ACTIVE', 'DISABLED']),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']),
})

function AdminUsersPage() {
  const authUser = getAuthUser()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [passwordTarget, setPasswordTarget] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      profile_image_url: '',
      status: 'ACTIVE',
      role: 'ADMIN',
    },
  })
  const profileImage = watch('profile_image_url')

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await getAdminUsers()
      setUsers(response?.items || response?.data?.items || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const onSubmit = async (values) => {
    setApiError('')

    try {
      if (!editingUser && (!values.password || values.password.length < 6)) {
        setApiError('Password must be at least 6 characters')
        return
      }

      if (editingUser) {
        await updateAdminUser(editingUser.id || editingUser._id, {
          full_name: values.full_name,
          email: values.email,
          profile_image_url: values.profile_image_url,
          status: values.status,
          role: values.role,
        })
      } else {
        await createAdminUser(values)
      }

      reset({ full_name: '', email: '', password: '', profile_image_url: '', status: 'ACTIVE', role: 'ADMIN' })
      setEditingUser(null)
      await loadUsers()
    } catch (error) {
      setApiError(error.response?.data?.message || `Unable to ${editingUser ? 'update' : 'create'} admin user`)
    }
  }

  const handleToggleStatus = async (user) => {
    const targetStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    await updateAdminUserStatus(user.id || user._id, targetStatus)
    await loadUsers()
  }

  const resetPassword = async () => {
    if (!passwordTarget || newPassword.length < 6) return

    setSavingPassword(true)
    setPasswordMessage('')
    try {
      await resetAdminUserPassword(passwordTarget.id || passwordTarget._id, newPassword)
      setPasswordMessage('Password reset successful.')
      setNewPassword('')
      await loadUsers()
    } catch (error) {
      setPasswordMessage(error.response?.data?.message || 'Unable to reset password')
    } finally {
      setSavingPassword(false)
    }
  }

  const toDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Unable to read file'))
      reader.readAsDataURL(file)
    })

  const columns = [
    {
      key: 'profile',
      title: 'Admin Profile',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.profile_image_url ? (
            <img src={row.profile_image_url} alt={row.full_name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
              {(row.full_name || 'A').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-slate-800">{row.full_name || '-'}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
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
    {
      key: 'role',
      title: 'Role',
      render: (row) => (
        <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{row.role || 'ADMIN'}</span>
      ),
    },
    {
      key: 'created_at',
      title: 'Created',
      render: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Toggle checked={row.status === 'ACTIVE'} label="Admin access" onChange={() => handleToggleStatus(row)} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingUser(row)
              setApiError('')
              reset({
                full_name: row.full_name || '',
                email: row.email || '',
                password: '',
                profile_image_url: row.profile_image_url || '',
                status: row.status || 'ACTIVE',
                role: row.role || 'ADMIN',
              })
            }}
          >
            <PencilLine size={14} className="mr-1" /> Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { setPasswordTarget(row); setPasswordMessage(''); setNewPassword('') }}>
            <KeyRound size={14} className="mr-1" /> Reset Password
          </Button>
        </div>
      ),
    },
  ]

  if (authUser?.role !== 'SUPER_ADMIN') {
    return (
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">Admin Users</h2>
        <p className="mt-2 text-sm text-amber-700">Only super admin can manage admin accounts.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">{editingUser ? 'Edit Admin Account' : 'Create Admin Account'}</h2>
        <p className="mt-1 text-sm text-slate-600">Create and edit admin profile accounts, control access, and reset passwords.</p>

        <form className="mt-4 grid gap-3 md:grid-cols-5" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('profile_image_url')} />
          <Input label="Full Name" placeholder="Admin name" error={errors.full_name?.message} {...register('full_name')} />
          <div className="md:col-span-2">
            <Input label="Admin Email" placeholder="new-admin@connetme.com" error={errors.email?.message} {...register('email')} />
          </div>
          <Input
            label={editingUser ? 'Password (optional)' : 'Password'}
            type="password"
            placeholder={editingUser ? 'Leave blank to keep current password' : '******'}
            error={errors.password?.message}
            {...register('password')}
          />
          <label className="flex w-full flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Initial Status</span>
            <select
              {...register('status')}
              className="h-11 rounded-xl border border-slate-200 bg-white/95 px-3 text-sm outline-none ring-blue-200 transition focus:border-blue-500 focus:ring-2"
            >
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </label>
          <label className="flex w-full flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <select
              {...register('role')}
              className="h-11 rounded-xl border border-slate-200 bg-white/95 px-3 text-sm outline-none ring-blue-200 transition focus:border-blue-500 focus:ring-2"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </label>

          <div className="md:col-span-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-700">Profile Image</p>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm text-slate-600"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const dataUrl = await toDataUrl(file)
                setValue('profile_image_url', dataUrl, { shouldDirty: true })
              }}
            />
            {profileImage ? <img src={profileImage} alt="Admin profile preview" className="mt-2 h-12 w-12 rounded-full object-cover" /> : null}
          </div>

          <div className="md:col-span-5 flex items-center gap-3">
            <Button type="submit" loading={isSubmitting}>{editingUser ? 'Save Changes' : 'Create Admin User'}</Button>
            {editingUser ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingUser(null)
                  setApiError('')
                  reset({ full_name: '', email: '', password: '', profile_image_url: '', status: 'ACTIVE', role: 'ADMIN' })
                }}
              >
                Cancel Edit
              </Button>
            ) : null}
            {apiError ? <p className="text-sm text-rose-600">{apiError}</p> : null}
          </div>
        </form>
      </Card>

      {passwordTarget ? (
        <Card className="p-5">
          <h3 className="text-base font-semibold text-slate-900">Reset Password</h3>
          <p className="mt-1 text-sm text-slate-600">
            Set a new password for <span className="font-medium text-slate-800">{passwordTarget.full_name || passwordTarget.email}</span>.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="w-full sm:max-w-sm">
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <Button onClick={resetPassword} loading={savingPassword} disabled={newPassword.length < 6}>
              Update Password
            </Button>
            <Button variant="ghost" onClick={() => setPasswordTarget(null)}>
              Cancel
            </Button>
          </div>
          {passwordMessage ? <p className="mt-2 text-sm text-blue-700">{passwordMessage}</p> : null}
        </Card>
      ) : null}

      <Card className="p-0">
        <Table columns={columns} rows={users} loading={loading} rowKey={(row) => row.id || row._id || row.email} emptyText="No admin users found." />
      </Card>
    </div>
  )
}

export default AdminUsersPage
