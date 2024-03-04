import { createEntityAdapter, createSelector } from '@reduxjs/toolkit'
import { apiSlice } from '../api/apiSlice'

const categoriesAdapter = createEntityAdapter()

const initialState = categoriesAdapter.getInitialState()

export const categoriesApi = apiSlice.injectEndpoints({
	tagTypes: ['Category'],
	endpoints: (builder) => ({
		getCategories: builder.query({
			query: () => `/categories`,
			// normalize response data returned by this query before it hits the cache
			transformResponse: (res) => {
				return categoriesAdapter.setAll(initialState, res)
			},
			providesTags: (result = [], error, arg) => [
				'Category',
				result?.ids
					? [
							...result.ids.map(({ id }) => ({ type: 'Category', id })),
							{ type: 'Category', id: 'LIST' },
					  ]
					: [{ type: 'Category', id: 'LIST' }],
			],
		}),
	}),
})

export const { useGetCategoriesQuery } = categoriesApi

//Calling the endpoint with `select(someArg)` will generate a selector function that will return the query result for a query with such parameter.
export const selectCategoriesResult =
	categoriesApi.endpoints.getCategories.select()

// generate memoized selector with `createSelector` from `reselect` library
const selectCategoriesData = createSelector(
	selectCategoriesResult,
	(categoriesResult) => categoriesResult.data
)

export const {
	selectAll: selectAllCategories,
	selectById: selectCategoryById,
} = categoriesAdapter.getSelectors(
	(state) => selectCategoriesData(state) ?? initialState
)
