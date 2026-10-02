import { Navigate, Route, Routes } from 'react-router-dom'
import Styles from './App.module.css'
import React, { Suspense, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import NavBar from '../NavBar/NavBar'
import {
	logoutUser,
	setCredentials,
	useGetUserQuery,
} from '../../features/auth/authSlice'
import {
	refreshCsrfToken,
	useLazyGetCsrfTokenQuery,
} from '../../features/csrf/csrfSlice'

const Home = React.lazy(() => import('../Home/Home'))
const Signup = React.lazy(() => import('../../features/auth/Signup/Signup'))
const Login = React.lazy(() => import('../../features/auth/Login/Login'))
const Profile = React.lazy(() => import('../../features/auth/Profile/Profile'))
const CocktailsContainer = React.lazy(() =>
	import('../../features/cocktails/CocktailsContainer/CocktailsContainer')
)
const CocktailDetail = React.lazy(() =>
	import('../../features/cocktails/CocktailDetail/CocktailDetail')
)
const CocktailEdit = React.lazy(() =>
	import('../../features/cocktails/CocktailEdit/CocktailEdit')
)
const CategoriesContainer = React.lazy(() =>
	import('../../features/categories/CategoriesContainer/CategoriesContainer')
)
const CategoryDetail = React.lazy(() =>
	import('../../features/categories/CategoryDetail/CategoryDetail')
)
const ProtectedRoute = React.lazy(() => import('../../routing/ProtectedRoute'))

function App() {
	const dispatch = useDispatch()
	const [triggerGetCsrfToken] = useLazyGetCsrfTokenQuery()

	// The CSRF token store is deliberately in-memory only, never persisted
	// (see csrfSlice.js) — a hard page refresh wipes it even though a
	// valid Rails session cookie (HttpOnly, survives reload) may still
	// exist. Without this, the first CSRF-protected mutation after a
	// refresh would fail with csrf_invalid despite the user still being
	// logged in (an anonymous visitor's first mutation needs a token too,
	// same fetch covers both cases).
	useEffect(() => {
		refreshCsrfToken(dispatch, triggerGetCsrfToken)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// App-bootstrap auth revalidation (PR 3). Deliberately placed here,
	// not in NavBar — this is an app-mount concern like the CSRF fetch
	// above, not something that should live wherever a component happens
	// to read auth state from. Required once PR 3 removes the
	// Authorization: Bearer header: a persisted auth.user pair
	// (redux-persist, see app/store.js) is no longer sufficient evidence
	// of being authenticated — only a live Rails session is. Runs
	// unconditionally (no `skip`) so a stale persisted "logged in" state
	// with no real session behind it (e.g. a pre-PR-2 bearer-only login
	// that never established one) gets caught here, instead of silently
	// 401ing on the user's next mutation.
	//
	// This same query (no args, so the same cache entry) is read again by
	// ProtectedRoute and NavBar to expose the not-yet-determined
	// ("checking") auth status to route guards/nav (PR 4) — calling the
	// hook there doesn't fire a second request, it just subscribes to the
	// pending/settled state of the fetch this call already triggers.
	const { data: userData, isSuccess, isError, error } = useGetUserQuery()

	useEffect(() => {
		if (isSuccess && userData) {
			// Reconciles with the server's authoritative response — covers
			// both "confirms persisted state is still valid" and restoring
			// state after a hard refresh, since only the `auth` slice (not
			// the RTK Query cache) survives via redux-persist.
			dispatch(setCredentials({ user: userData }))
		} else if (isError && error?.status === 401) {
			// No live session — any persisted auth.user is stale. Clear it
			// so the UI reflects reality instead of a "logged in" state
			// that can't actually perform any mutation.
			dispatch(logoutUser())
		}
		// This must act once on this one app-load /me result, not re-fire
		// against that same (by then stale) result later — Login.jsx,
		// Signup.jsx, and NavBar's logout handler all set credentials
		// directly from their own authoritative response, independent of
		// this check.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSuccess, isError, error, userData])

	return (
		<div className={Styles.App}>
			<NavBar />
			<Suspense fallback={<div>Loading...</div>}>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/login" element={<Login />} />
					<Route element={<ProtectedRoute />}>
						<Route path="/profile" element={<Profile />} />
						<Route path="/cocktails/:id/edit" element={<CocktailEdit />} />
					</Route>
					<Route path="/categories" element={<CategoriesContainer />} />
					<Route path="/categories/:id" element={<CategoryDetail />} />
					<Route path="/cocktails" element={<CocktailsContainer />} />
					<Route path="/cocktails/:id" element={<CocktailDetail />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>
		</div>
	)
}

export default App
