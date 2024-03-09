import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import store, { persistor } from './app/store'
import App from './components/App'
import { categoriesApi } from './features/categories/categoriesSlice'
import { usersApi } from './features/users/usersSlice'
import './index.css'
import reportWebVitals from './reportWebVitals'
import { PersistGate } from 'redux-persist/integration/react'
import { cocktailsApi } from './features/cocktails/cocktailsSlice'

async function start() {
	store.dispatch(categoriesApi.endpoints.getCategories.initiate())
	store.dispatch(usersApi.endpoints.getUsers.initiate())
	store.dispatch(cocktailsApi.endpoints.getCocktails.initiate())
}

ReactDOM.render(
	<Provider store={store}>
		<PersistGate loading={null} persistor={persistor}>
			<React.StrictMode>
				<Router>
					<App />
				</Router>
			</React.StrictMode>
		</PersistGate>
	</Provider>,
	document.getElementById('root')
)

start()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
