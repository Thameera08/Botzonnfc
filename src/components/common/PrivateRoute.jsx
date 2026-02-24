import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../../utils/auth'

function PrivateRoute({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}

export default PrivateRoute
