import { Navigate, Route, Routes } from 'react-router-dom'
import Styles from './App.module.css'
import React, { Suspense } from 'react'
import NavBar from '../NavBar/NavBar'

const Home = React.lazy(() => import('../Home/Home'))
const Signup = React.lazy(() => import('../../features/auth/Signup/Signup'))
const Login = React.lazy(() => import('../../features/auth/Login/Login'))
const Profile = React.lazy(() => import('../../features/auth/Profile'))
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
						<Route path="/cocktails" element={<CocktailsContainer />} />
						<Route path="/cocktails/:id" element={<CocktailDetail />} />
						<Route path="/cocktails/:id/edit" element={<CocktailEdit />} />
					</Route>
					<Route path="/categories" element={<CategoriesContainer />} />
					<Route path="/categories/:id" element={<CategoryDetail />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>
		</div>
	)
}

export default App
