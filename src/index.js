import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import store, { persistor } from './app/store'
import App from './components/App/App'
import { categoriesApi } from './features/categories/categoriesSlice'
import { usersApi } from './features/users/usersSlice'
// Self-hosted V1 design-system fonts (ai/v1-redesign-plan.md PR1,
// decision #6). 'full' variants include both the opsz and SOFT variable
// axes design-tokens.css's type scale uses. Registers the
// '--font-fraunces'/'--font-instrument-sans' font-family values consumed
// by design-tokens.css's @theme block — importing them doesn't change
// anything visually yet since no element's font-family references those
// tokens until a later PR.
import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource-variable/instrument-sans'
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
