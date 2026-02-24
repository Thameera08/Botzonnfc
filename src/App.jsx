import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/common/PrivateRoute'
import AdminLayout from './components/layout/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import LoginPage from './pages/admin/LoginPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import MyAccountPage from './pages/admin/MyAccountPage'
import ProfileFormPage from './pages/admin/ProfileFormPage'
import ProfilesPage from './pages/admin/ProfilesPage'
import PublicProfilePage from './pages/public/PublicProfilePage'
import { getAuthUser } from './utils/auth'

function AdminHomeRedirect() {
  const role = getAuthUser()?.role
  return <Navigate to={role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/admin/my-account'} replace />
}

function SuperAdminOnly({ children }) {
  const role = getAuthUser()?.role
  if (role !== 'SUPER_ADMIN') return <Navigate to="/admin/my-account" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminHomeRedirect />} />
        <Route
          path="dashboard"
          element={
            <SuperAdminOnly>
              <DashboardPage />
            </SuperAdminOnly>
          }
        />
        <Route path="my-account" element={<MyAccountPage />} />
        <Route
          path="users"
          element={
            <SuperAdminOnly>
              <AdminUsersPage />
            </SuperAdminOnly>
          }
        />
        <Route
          path="profiles"
          element={
            <SuperAdminOnly>
              <ProfilesPage />
            </SuperAdminOnly>
          }
        />
        <Route
          path="profiles/new"
          element={
            <SuperAdminOnly>
              <ProfileFormPage mode="create" />
            </SuperAdminOnly>
          }
        />
        <Route path="profiles/:id/edit" element={<ProfileFormPage mode="edit" />} />
      </Route>

      <Route path="/:username" element={<PublicProfilePage />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  )
}

export default App
