import { apiSlice } from '../api/apiSlice'

export const likesApi = apiSlice.injectEndpoints({
	tagTypes: ['Like'],
	endpoints: (builder) => ({
		addNewLike: builder.mutation({
			query: (body) => ({
				url: `/likes`,
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Like', 'Cocktail'],
		}),
		deleteLike: builder.mutation({
			query: (id) => ({
				url: `/likes/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, arg) => [
				{ type: 'Like', id: arg.id },
				{ type: 'Cocktail', id: arg.liked_cocktail_id },
			],
		}),
	}),
})

export const { useAddNewLikeMutation, useDeleteLikeMutation } = likesApi
