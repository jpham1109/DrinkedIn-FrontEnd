import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice ({
    name: "user",
    initialState: {
        entities: [],
        // cocktails: [],
        // likes: [],
        loggedin: false,
    },
    reducers: {
        updateUser: (state, action) => {
            return {
                ...state,
                user: action.payload,
                cocktails: action.payload.cocktails,
                likes: action.payload.likes,
                loggedin: true
            }
        },

        // addCocktail: (state, action) => {
        //     state.cocktails.push(action.payload)
        // },

        // deleteCocktail: (state, action) => {
        //     const cocktails = state.cocktails.filter((cocktail) => cocktail.id !== action.payload)
        //     return {
        //         ...state,
        //         ...cocktails
        //     }
        // },

        logoutUser: (state) => {
            return {
                user: [],
                cocktails: [],
                likes: [],
                loggedin: false
            }
        }
    }       
})

// const updateUser = userSlice.actions.updateUser
// const logoutUser = userSlice.actions.logoutUser

export const { updateUser, logoutUser } = userSlice.actions

export default userSlice.reducer;