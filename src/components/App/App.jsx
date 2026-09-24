import { Navigate, Route, Routes } from 'react-router-dom'
import Styles from './App.module.css'
import React, { Suspense, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import NavBar from '../NavBar/NavBar'
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
	// logged in. Scoped narrowly to just re-fetching the token — the full
	// "what does the app believe its auth state is on refresh" bootstrap
	// (unknown/checking state, /me call, route guard behavior) remains
	// PR 4's job; this only prevents the CSRF gap PR 2 would otherwise
	// leave on every hard refresh, session or not (an anonymous visitor's
	// first mutation needs a token too, same fetch covers both cases).
	useEffect(() => {
		refreshCsrfToken(dispatch, triggerGetCsrfToken)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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
