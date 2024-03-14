import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { selectCurrentUser } from '../features/auth/authSlice'

const ProtectedRoute = () => {
	// Query hook to fetch current user
	const currentUser = useSelector(selectCurrentUser)

	// redirect to login page if user is not logged in
	if (!currentUser) {
		return <Navigate to="/login" />
	}

	return <Outlet />
}

export default ProtectedRoute
