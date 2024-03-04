import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../features/api/apiSlice.js'
import authReducer from '../features/auth/authSlice.js'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import {
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from 'redux-persist/es/constants'

// Redux persist configuration
const persistConfig = {
	key: 'root',
	storage,
}

const persistedAuthReducer = persistReducer(persistConfig, authReducer)

const store = configureStore({
	reducer: {
		auth: persistedAuthReducer,
		// Add the generated reducer as a specific top-level slice
		[apiSlice.reducerPath]: apiSlice.reducer,
	},
	// Adding the api middleware enables caching, invalidation, polling, and other features of `rtk-query`.
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).concat(apiSlice.middleware),
})

export const persistor = persistStore(store)

export default store
