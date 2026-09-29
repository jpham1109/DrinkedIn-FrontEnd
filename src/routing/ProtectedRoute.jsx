import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { selectCurrentUser, useGetUserQuery } from '../features/auth/authSlice'

const ProtectedRoute = () => {
	const currentUser = useSelector(selectCurrentUser)

	// Shares the same cache entry as App.jsx's app-mount /me call (same
	// endpoint, no args, so no extra request is fired) — reading its
	// pending state here is how the not-yet-determined auth status reaches
	// this route guard, instead of it deciding off possibly-stale persisted
	// Redux state alone (ai/auth-migration-plan.md PR 4).
	const { isLoading, isUninitialized } = useGetUserQuery()

	if (isUninitialized || isLoading) {
		return <div>Checking login status...</div>
	}

	// redirect to login page if user is not logged in
	if (!currentUser) {
		return <Navigate to="/login" />
	}

	return <Outlet />
}

export default ProtectedRoute
