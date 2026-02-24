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
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="my-account" element={<MyAccountPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="profiles" element={<ProfilesPage />} />
        <Route path="profiles/new" element={<ProfileFormPage mode="create" />} />
        <Route path="profiles/:id/edit" element={<ProfileFormPage mode="edit" />} />
      </Route>

      <Route path="/:username" element={<PublicProfilePage />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  )
}

export default App
