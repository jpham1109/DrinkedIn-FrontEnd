import { createSlice } from '@reduxjs/toolkit'


export const userSlice = createSlice ({
    name: "user",
    initialState: {
        user: [],
        cocktails: [],
        likes: [],
        followed_users: [],
        following_users: [],
        loggedin: false,
    },
    reducers: {
        updateUser: (state, action) => {
            return {
                ...state,
                user: action.payload,
                cocktails: action.payload.cocktails,
                likes: action.payload.likes,
                followed_users: action.payload.followed_users,
                following_users: action.payload.following_users,
                loggedin: true
            }
        },

        addUserCocktail: (state, action) => {
            state.cocktails.push(action.payload)
        },

        deleteUserLike: (state, action) => {
            const likes = state.likes.filter((like) => like.id !== action.payload.id)
                return {
                    ...state,
                    ...likes
                }
        },

        // updateUserCocktail: (state, action) => {
            
        //     const cocktails = state.cocktails.map(cocktail => {
        //         if (cocktail.id === action.payload.id){
        //             return action.payload
        //         } else {
        //             return cocktail
        //         }
        //     })
        //     return cocktails
        // },
        deleteUserCocktail: (state, action) => {
            const cocktails = state.cocktails.filter((cocktail) => cocktail.id !== action.payload)
            return {
                ...state,
                ...cocktails
            }
        },

        logoutUser: (state) => {
            return {
                user: [],
                cocktails: [],
                likes: [],
                followed_users: [],
                following_users: [],
                loggedin: false
            }
        }
    }       
})

// const updateUser = userSlice.actions.updateUser
// const logoutUser = userSlice.actions.logoutUser

export const { updateUser, deleteUserLike, logoutUser, addUserCocktail, updateUserCocktail, deleteUserCocktail } = userSlice.actions

export default userSlice.reducer;