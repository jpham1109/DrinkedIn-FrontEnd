import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchUser = createAsyncThunk("user/fetchUser", () => {
    return fetch("http://localhost:7000/me")
    .then((response) => response.json())
    .then((cocktails) => cocktails );
})

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

        addUserLike: (state, action) => {
            state.likes.push(action.payload)
        },

        deleteUserLike: (state, action) => {
            const likes = state.likes.filter((like) => like.id !== action.payload.id)
                return {
                    ...state,
                    ...likes
                }
        },

        addUserFollow: (state, action) => {
            state.followed_users.push(action.payload)
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
    },
    extraReducers: {
        // handle async action types
        [fetchUser.pending](state) {
          state.status = "loading";
        },
        [fetchUser.fulfilled](state, action) {
          state.entities = action.payload;
          state.status = "idle";
        },
      }       
})

export const { updateUser, deleteUserLike, logoutUser, addUserFollow, addUserLike, addUserCocktail, updateUserCocktail, deleteUserCocktail } = userSlice.actions

export default userSlice.reducer;