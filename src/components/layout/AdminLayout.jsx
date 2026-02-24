import { LayoutDashboard, LogOut, Shield, UserCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearToken } from '../../utils/auth'
import { subscribeRequestState } from '../../utils/requestLoader'

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Admin Users', to: '/admin/users', icon: Shield },
  { label: 'Profiles', to: '/admin/profiles', icon: UserCircle2 },
]

function AdminLayout() {
  const navigate = useNavigate()
  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribeRequestState(setPendingRequests)
    return unsubscribe
  }, [])

  const handleLogout = () => {
    clearToken()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 md:flex-row md:px-6">
        <aside className="modern-panel w-full rounded-2xl p-3 md:sticky md:top-4 md:h-fit md:w-64">
          <Link
            to="/admin/dashboard"
            className="mb-4 block rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,111,255,0.28)]"
          >
            ConnetMe Admin
          </Link>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
          >
            <LogOut size={16} /> Logout
          </button>
        </aside>

        <main className="w-full">
          {pendingRequests > 0 ? (
            <div className="mb-3 overflow-hidden rounded-xl border border-blue-100 bg-blue-50">
              <div className="h-1 w-full animate-pulse bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
              <p className="px-3 py-1 text-xs font-medium text-blue-700">Loading data...</p>
            </div>
          ) : null}
          <div className="modern-panel mb-4 rounded-2xl px-4 py-3">
            <h1 className="text-lg font-semibold text-slate-900">ConnetMe Admin Portal</h1>
            <p className="text-xs text-slate-500">Manage accounts, digital profiles, themes, and QR access.</p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
