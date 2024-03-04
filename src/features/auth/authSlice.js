import { createSlice } from '@reduxjs/toolkit'
import { apiSlice } from '../api/apiSlice'

export const authApi = apiSlice.injectEndpoints({
	tagTypes: ['User'],
	endpoints: (builder) => ({
		loginUser: builder.mutation({
			query: (credentials) => ({
				url: `/login`,
				method: 'POST',
				body: credentials,
			}),
		}),
		signupUser: builder.mutation({
			query: (body) => ({
				url: `/signup`,
				method: 'POST',
				body,
			}),
			invalidatesTags: ['User'],
		}),
		getUser: builder.query({
			query: () => ({
				url: `/me`,
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: localStorage.token,
				},
			}),
		}),
		updateUser: builder.mutation({
			query: (formData) => ({
				url: `/me`,
				method: 'PATCH',
				body: formData,
			}),
			invalidatesTags: (result, error, arg) => [{ type: 'User', id: arg.id }],
		}),
		deleteUser: builder.mutation({
			query: (id) => ({
				url: `/users/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, arg) => [{ type: 'User', id: arg.id }],
		}),
	}),
})

export const {
	useLoginUserMutation,
	useSignupUserMutation,
	useGetUserQuery,
	useUpdateUserMutation,
	useDeleteUserMutation,
} = authApi

const authToken = localStorage.getItem('token')
	? localStorage.getItem('token')
	: null
const initialState = {
	user: null,
	token: authToken,
}

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setCredentials: (state, action) => {
			state.user = action.payload.user
			state.token = action.payload.token
		},

		updateUserProfile: (state, action) => {
			return {
				...state,
				user: {
					...state.user,
					...action.payload,
				},
			}
		},

		addUserCocktail: (state, action) => {
			return {
				...state,
				user: {
					...state.user,
					cocktails: [...state.user.cocktails, action.payload],
				},
			}
		},

		addUsersLike: (state, action) => {
			return {
				...state,
				user: {
					...state.user,
					likes: [...state.user.likes, action.payload],
				},
			}
		},

		deleteUsersLike: (state, action) => {
			const updatedLikes = state.user.likes.filter(
				(like) => like.id !== action.payload
			)
			return {
				...state,
				user: {
					...state.user,
					likes: updatedLikes,
				},
			}
		},

		addUserToFollow: (state, action) => {
			return {
				...state,
				user: {
					...state.user,
					followed_users: [...state.user.followed_users, action.payload],
				},
			}
		},

		deleteUserFollowed: (state, action) => {
			//new array of followed users that does not include the user that was unfollowed
			const followedUsers = state.user.followed_users.filter(
				(follow) => follow.id !== action.payload
			)
			return {
				...state,
				user: {
					...state.user,
					followed_users: followedUsers,
				},
			}
		},

		deleteUsersFollower: (state, action) => {
			// new array of followers that does not include the user that was removed from list of followers
			const followers = state.user.following_users.filter(
				(following) => following.id !== action.payload
			)
			return {
				...state,
				user: {
					...state.user,
					following_users: followers,
				},
			}
		},
		updateUsersCocktail: (state, action) => {
			const cocktails = state.user.cocktails.map((cocktail) => {
				if (cocktail.id === action.payload.id) {
					return action.payload
				} else {
					return cocktail
				}
			})
			return {
				...state,
				user: {
					...state.user,
					cocktails: cocktails,
				},
			}
		},

		deleteUsersCocktail: (state, action) => {
			const updatedCocktailsCreated = state.user.cocktails.filter(
				(cocktail) => cocktail.id !== action.payload
			)
			return {
				...state,
				user: {
					...state.user,
					cocktails: updatedCocktailsCreated,
				},
			}
		},

		logoutUser: (state) => {
			return {
				...state,
				user: null,
				token: null,
			}
		},
	},
})

export const {
	setCredentials,
	updateUserProfile,
	deleteUsersLike,
	logoutUser,
	addUserToFollow,
	deleteUserFollowed,
	deleteUsersFollower,
	addUsersLike,
	addUserCocktail,
	updateUsersCocktail,
	deleteUsersCocktail,
} = authSlice.actions

export default authSlice.reducer

// User info
export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentUsersId = (state) => state.auth.user.id
export const selectCurrentUsersToken = (state) => state.auth.token
// Select all the bars that the current user work for
export const selectCurrentUsersBars = (state) => state.auth.user.bars
// Select all the cocktails that the current user has created
export const selectCurrentUsersCocktails = (state) => state.auth.user.cocktails
// Select all the cocktails that the current user has liked
export const selectCurrentUsersLikes = (state) => state.auth.user.likes
// Select all the users that are following the current user
export const selectCurrentUsersFollowers = (state) =>
	state.auth.user.following_users
// Select all the users that the current user is following
export const selectUsersFollowedByCurrentUser = (state) =>
	state.auth.user.followed_users
