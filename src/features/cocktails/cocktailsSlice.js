import { createEntityAdapter, createSelector } from '@reduxjs/toolkit'
import { apiSlice } from '../api/apiSlice'

const cocktailsAdapter = createEntityAdapter()

const initialState = cocktailsAdapter.getInitialState()

export const cocktailsApi = apiSlice.injectEndpoints({
	tagTypes: ['Cocktail'],
	endpoints: (builder) => ({
		getCocktails: builder.query({
			query: () => `/cocktails`,
			transformResponse: (res) => {
				return cocktailsAdapter.setAll(initialState, res)
			},
			providesTags: (result = [], error, arg) => [
				// if we have a result, we want to invalidate the query whenever we add or update a cocktail
				'Cocktail',
				result?.ids
					? [...result.ids.map(({ id }) => ({ type: 'Cocktail', id }))]
					: [{ type: 'Cocktail', id: 'LIST' }],
			],
		}),
		getCocktail: builder.query({
			query: (id) => `/cocktails/${id}`,
			// transformResponse: (res) => {
			// 	cocktailsAdapter.addOne(initialState, res)
			// 	return res
			// },
			providesTags: (result, error, arg) => [
				{ type: 'Cocktail', id: arg },
				'Like',
			],
		}),
		addNewCocktail: builder.mutation({
			query: (body) => ({
				url: `/cocktails`,
				method: 'POST',
				body,
			}),
			// transformResponse: (res) => {
			// 	cocktailsAdapter.addOne(initialState, res)
			// 	return res
			// },
			invalidatesTags: (result, error, arg) => [
				{ type: 'Cocktail', id: 'LIST' }, // Invalidate the list tag to trigger a refetch
			],
		}),
		editCocktail: builder.mutation({
			query: (updatedFields) => ({
				url: `/cocktails/${updatedFields.get('id')}`,
				method: 'PATCH',
				body: updatedFields,
			}),
			invalidatesTags: (result, error, arg) => [
				{ type: 'Cocktail', id: 'LIST' },
				{ type: 'Cocktail', id: arg.id },
			],
		}),
		deleteCocktail: builder.mutation({
			query: (id) => ({
				url: `/cocktails/${id}`,
				method: 'DELETE',
			}),
			// transformResponse: (id) => {
			// 	cocktailsAdapter.removeOne(initialState, id)
			// 	return cocktailsAdapter.getInitialState()
			// },
			invalidatesTags: (result, error, arg) => [
				{ type: 'Cocktail', id: 'LIST' },
				{ type: 'Cocktail', id: arg },
				'Like',
			],
		}),
	}),
})

export const {
	useGetCocktailsQuery,
	useGetCocktailQuery,
	useAddNewCocktailMutation,
	useEditCocktailMutation,
	useDeleteCocktailMutation,
} = cocktailsApi

//Calling the endpoint with `select(someArg)` will generate a selector function that will return the query result for a query with such parameter.
//cocktails data is fetched in CocktailsContainer component using useGetCocktailsQuery hook
export const selectGetCocktailsQueryResult =
	cocktailsApi.endpoints.getCocktails.select()

// generate memoized selector with `createSelector` from `reselect` library
export const selectCocktailsData = createSelector(
	selectGetCocktailsQueryResult,
	(cocktailsResult) => cocktailsResult.data
)

export const { selectAll: selectAllCocktails, selectById: selectCocktailById } =
	cocktailsAdapter.getSelectors(
		(state) => selectCocktailsData(state) ?? initialState
	)
