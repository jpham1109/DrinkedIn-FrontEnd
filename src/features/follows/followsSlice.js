import { apiSlice } from '../api/apiSlice'

export const followsApi = apiSlice.injectEndpoints({
	tagTypes: ['Follow', 'User'],
	endpoints: (builder) => ({
		addNewFollow: builder.mutation({
			query: (body) => ({
				url: `/follows`,
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Follow', 'User'],
		}),
		deleteFollow: builder.mutation({
			query: (id) => ({
				url: `/follows/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, arg) => [
				{ type: 'Follow', id: arg.id },
				{ type: 'User', id: arg.followee_id },
			],
		}),
	}),
})

export const { useAddNewFollowMutation, useDeleteFollowMutation } = followsApi
