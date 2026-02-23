import { Activity, Ban, CreditCard, PieChart, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import { getDashboard } from '../../services/api/profileApi'

const statConfig = [
  { key: 'total_profiles', label: 'Total Profiles', icon: Users, tone: 'text-blue-700 bg-blue-50' },
  { key: 'active_profiles', label: 'Active Accounts', icon: Activity, tone: 'text-emerald-700 bg-emerald-50' },
  { key: 'disabled_profiles', label: 'Inactive Accounts', icon: Ban, tone: 'text-amber-700 bg-amber-50' },
  { key: 'nfc_assigned_count', label: 'NFC Assigned', icon: CreditCard, tone: 'text-indigo-700 bg-indigo-50' },
]

function DashboardPage() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getDashboard()
        setStats(data?.data || data)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totals = useMemo(() => {
    const total = Number(stats?.total_profiles || 0)
    const active = Number(stats?.active_profiles || 0)
    const inactive = Number(stats?.disabled_profiles || 0)
    const nfc = Number(stats?.nfc_assigned_count || 0)

    return {
      total,
      active,
      inactive,
      nfc,
      activePercent: total ? Math.round((active / total) * 100) : 0,
      inactivePercent: total ? Math.round((inactive / total) * 100) : 0,
      nfcPercent: total ? Math.round((nfc / total) * 100) : 0,
    }
  }, [stats])

  const donutStyle = {
    background: `conic-gradient(#10b981 0 ${totals.activePercent}%, #f59e0b ${totals.activePercent}% 100%)`,
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statConfig.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.key} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${item.tone}`}>
                  <Icon size={16} />
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : stats[item.key] ?? 0}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Accounts Chart View</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Split</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="relative h-24 w-24 rounded-full" style={donutStyle}>
                  <div className="absolute inset-[10px] grid place-items-center rounded-full bg-white text-xs font-semibold text-slate-700">
                    {totals.total}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-slate-700">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Active: {totals.active} ({totals.activePercent}%)
                  </p>
                  <p className="flex items-center gap-2 text-slate-700">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Inactive: {totals.inactive} ({totals.inactivePercent}%)
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">NFC Coverage</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{totals.nfcPercent}%</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${totals.nfcPercent}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {totals.nfc} of {totals.total} accounts have NFC UID assigned.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-semibold text-slate-900">Quick Insights</h3>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span>Active Accounts</span>
                <span>{totals.activePercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${totals.activePercent}%` }} />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span>Inactive Accounts</span>
                <span>{totals.inactivePercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${totals.inactivePercent}%` }} />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span>NFC Assigned</span>
                <span>{totals.nfcPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${totals.nfcPercent}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
