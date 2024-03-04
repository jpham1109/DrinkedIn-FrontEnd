import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import '../App.css'
import Login from '../features/auth/Login'
import Profile from '../features/auth/Profile'
import Signup from '../features/auth/Signup'
import CategoriesContainer from '../features/categories/CategoriesContainer'
import CategoryDetail from '../features/categories/CategoryDetail'
import CocktailDetail from '../features/cocktails/CocktailDetail'
import CocktailEdit from '../features/cocktails/CocktailEdit'
import CocktailsContainer from '../features/cocktails/CocktailsContainer'
import ProtectedRoute from '../routing/ProtectedRoute'
import Home from './Home'
import NavBar from './NavBar'

function App() {
	return (
		<div className="App">
			<NavBar />
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
		</div>
	)
}

export default App
