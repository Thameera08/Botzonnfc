import { LayoutDashboard, LogOut, Shield, UserCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import BrandLogo2 from '../common/BrandLogo2'
import { clearAuth, getAuthUser, setAuthUser } from '../../utils/auth'
import { subscribeRequestState } from '../../utils/requestLoader'
import { getMe } from '../../services/api/authApi'

function AdminLayout() {
  const navigate = useNavigate()
  const [pendingRequests, setPendingRequests] = useState(0)
  const [authUser, setLocalAuthUser] = useState(() => getAuthUser())

  const navItems = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, show: authUser?.role === 'SUPER_ADMIN' },
    { label: 'My Profile', to: '/admin/my-account', icon: UserCircle2, show: true },
    { label: 'Admin Users', to: '/admin/users', icon: Shield, show: authUser?.role === 'SUPER_ADMIN' },
    { label: 'Profiles', to: '/admin/profiles', icon: UserCircle2, show: true },
  ].filter((item) => item.show)

  useEffect(() => {
    const unsubscribe = subscribeRequestState(setPendingRequests)
    return unsubscribe
  }, [])

  useEffect(() => {
    const loadMe = async () => {
      if (authUser?.role) return
      try {
        const me = await getMe()
        setAuthUser(me)
        setLocalAuthUser(me)
      } catch {
        // auth interceptor handles invalid token
      }
    }

    loadMe()
  }, [authUser])

  const handleLogout = () => {
    clearAuth()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 md:flex-row md:px-6">
        <aside className="modern-panel w-full rounded-2xl p-3 md:sticky md:top-4 md:h-fit md:w-64">
          <Link
            to="/admin/profiles"
            className="mb-4 flex items-center justify-center rounded-xl bg-white px-3 py-3 shadow-[0_10px_20px_rgba(15,111,255,0.14)]"
          >
            <BrandLogo2 imageClassName="h-12 w-auto max-w-none" />
          </Link>
          <nav className="space-y-1 ">
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
