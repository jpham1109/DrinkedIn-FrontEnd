import { apiSlice } from '../api/apiSlice'

export const followsApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		addNewFollow: builder.mutation({
			query: (body) => ({
				url: `/follows`,
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Follow', 'User'],
		}),
		// Neither mutation's 'Follow' tag currently does anything: no query in
		// this app provides a 'Follow' tag (there's no getFollows-style list
		// endpoint), so invalidating it is a no-op. Revisit if one is added.
		deleteFollow: builder.mutation({
			query: (id) => ({
				url: `/follows/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['User'],
		}),
	}),
})

export const { useAddNewFollowMutation, useDeleteFollowMutation } = followsApi
