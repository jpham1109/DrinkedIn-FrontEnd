import { createEntityAdapter, createSelector } from '@reduxjs/toolkit'
import { apiSlice } from '../api/apiSlice'

const cocktailsAdapter = createEntityAdapter()

const initialState = cocktailsAdapter.getInitialState()

export const cocktailsApi = apiSlice.injectEndpoints({
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
					? [
							...result.ids.map(({ id }) => ({ type: 'Cocktail', id })),
							[{ type: 'Cocktail', id: 'LIST' }],
					  ]
					: [{ type: 'Cocktail', id: 'LIST' }],
			],
		}),
		getCocktail: builder.query({
			query: (id) => `/cocktails/${id}`,
			// arg IS the id (see query above), not an object with an .id
			// property — `arg.id` was always undefined, so this endpoint's
			// own per-cocktail cache was never actually tagged with a
			// matching id and could never be specifically invalidated (e.g.
			// by deleteLike/deleteCocktail's `{type:'Cocktail', id: arg.id}`
			// invalidation). Had zero consumers before CocktailDetail's
			// migration (ai/v1-redesign-plan.md PR7), so this was latent.
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
			transformResponse: (res) => {
				cocktailsAdapter.addOne(initialState, res)
				return res
			},
			invalidatesTags: (result, error, arg) => [
				{ type: 'Cocktail', id: arg.id },
				{ type: 'Cocktail', id: 'LIST' }, // Invalidate the list tag to trigger a refetch
			],
		}),
		editCocktail: builder.mutation({
			query: (updatedFields) => ({
				url: `/cocktails/${updatedFields.get('id')}`,
				method: 'PATCH',
				body: updatedFields,
			}),
			transformResponse: (res) => {
				cocktailsAdapter.updateOne(initialState, res)
				return res
			},
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
			transformResponse: (res) => {
				cocktailsAdapter.removeOne(initialState, res)
				return cocktailsAdapter.getInitialState()
			},
			invalidatesTags: (result, error, arg) => [
				{ type: 'Cocktail', id: 'LIST' },
				{ type: 'Cocktail', id: arg.id },
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

// Home's Hero featured-cocktail ranking (ai/v1-redesign-plan.md PR9) —
// deterministic: likes_count desc, then created_at desc, then id asc.
// created_at is a real, already-existing column (confirmed via
// db/schema.rb) that just wasn't serialized before this PR — exposed in
// CocktailSerializer specifically so this tie-break is possible, not
// invented client-side from nothing. selectAllCocktails already reflects
// the FULL platform dataset, not a page of it — confirmed via
// CocktailsController#index, which has no .limit/.page anywhere and
// render_collection never includes pagination meta — so this ranking is
// a genuine platform-wide ranking, not a partial one.
export const selectCocktailsRankedByLikes = createSelector(selectAllCocktails, (cocktails) =>
	[...cocktails].sort((a, b) => {
		if (b.likes_count !== a.likes_count) return b.likes_count - a.likes_count
		const byDate = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		if (byDate !== 0) return byDate
		return a.id - b.id
	})
)

// The single cocktail Hero features. Prefers the top-ranked cocktail that
// also has a usable photo (CocktailSerializer's `photo` is nil whenever
// no image is attached — confirmed via ImageAttachable) — scans forward
// through the ranking rather than only checking rank #1, so a highly-
// liked-but-photo-less cocktail doesn't silently win Hero's spot over a
// slightly-less-liked one that actually has an image. Falls back to the
// overall #1 (photo or not) if nothing in the dataset has a photo at
// all — CocktailImage already renders a graceful "Photo coming soon"
// fallback in that case, same as everywhere else it's used. Returns
// undefined on a genuinely empty dataset — Hero must handle that, not
// this selector.
export const selectFeaturedCocktail = createSelector(selectCocktailsRankedByLikes, (ranked) => {
	if (ranked.length === 0) return undefined
	return ranked.find((c) => c.photo) ?? ranked[0]
})
