import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import Toggle from '../../components/ui/Toggle'
import { createAdminUser, getAdminUsers, updateAdminUserStatus } from '../../services/api/authApi'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  status: z.enum(['ACTIVE', 'DISABLED']),
})

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      status: 'ACTIVE',
    },
  })

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
      await createAdminUser(values)
      reset({ email: '', password: '', status: 'ACTIVE' })
      await loadUsers()
    } catch (error) {
      setApiError(error.response?.data?.message || 'Unable to create admin user')
    }
  }

  const handleToggleStatus = async (user) => {
    const targetStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    await updateAdminUserStatus(user.id || user._id, targetStatus)
    await loadUsers()
  }

  const columns = [
    { key: 'email', title: 'Email' },
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
      key: 'created_at',
      title: 'Created',
      render: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'),
    },
    {
      key: 'access',
      title: 'Access',
      render: (row) => (
        <Toggle
          checked={row.status === 'ACTIVE'}
          label="Admin access"
          onChange={() => handleToggleStatus(row)}
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">Create Admin Account</h2>
        <p className="mt-1 text-sm text-slate-600">Create admin users and control system access (active/inactive).</p>

        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="md:col-span-2">
            <Input label="Admin Email" placeholder="new-admin@connetme.com" error={errors.email?.message} {...register('email')} />
          </div>
          <Input label="Password" type="password" placeholder="******" error={errors.password?.message} {...register('password')} />
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

          <div className="md:col-span-4 flex items-center gap-3">
            <Button type="submit" loading={isSubmitting}>Create Admin User</Button>
            {apiError ? <p className="text-sm text-rose-600">{apiError}</p> : null}
          </div>
        </form>
      </Card>

      <Card className="p-0">
        <Table columns={columns} rows={users} rowKey={(row) => row.id || row._id || row.email} emptyText={loading ? 'Loading users...' : 'No admin users found.'} />
      </Card>
    </div>
  )
}

export default AdminUsersPage
