import { configureStore } from '@reduxjs/toolkit'
import userReducer  from '../features/user/userSlice.js'
import cocktailsReducer  from '../features/cocktails/cocktailsSlice.js'
import categoriesReducer  from '../features/categories/categoriesSlice.js'


const store = configureStore({
    reducer: {
        user: userReducer,
        cocktails: cocktailsReducer,
        categories: categoriesReducer,
    }
})

export default store