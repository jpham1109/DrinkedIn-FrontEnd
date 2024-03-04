import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '../components/Spinner'
import { useGetUserQuery } from '../features/auth/authSlice'

const ProtectedRoute = () => {
	// Query hook to fetch current user
	const { data: currentUser, isError, isLoading } = useGetUserQuery()

	if (isLoading) {
		return <Spinner />
	}
	// redirect to login page if user is not logged in
	if (isError || !currentUser) {
		return <Navigate to="/login" />
	}

	return <Outlet />
}

export default ProtectedRoute
