import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";

const cocktailsAdapter = createEntityAdapter();

const initialState = cocktailsAdapter.getInitialState();

export const cocktailsApi = apiSlice.injectEndpoints({
  tagTypes: ["Cocktail"],
  endpoints: (builder) => ({
    getCocktails: builder.query({
      query: () => `/cocktails`,
      // normalize response data returned by this query before it hits the cache
      transformResponse: (res) => {
        console.log(cocktailsAdapter.setAll(initialState, res), "res");
        return cocktailsAdapter.setAll(initialState, res);
      },
      providesTags: (result, error, arg) => [
        // if we have a result, we want to invalidate the query whenever we add or update a cocktail
        "Cocktail",
        ...result.ids.map(({ id }) => ({ type: "Cocktail", id })),
      ],
    }),
    getCocktail: builder.query({
      query: (id) => `/cocktails/${id}`,
      providesTags: (result, error, arg) => [{ type: "Cocktail", id: arg }],
    }),
    addCocktail: builder.mutation({
      query: (body) => ({
        url: `/cocktails`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cocktail"],
    }),
    editCocktail: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/cocktails/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Cocktail", id: arg.id },
      ],
    }),
  }),
});

export const {
  useGetCocktailsQuery,
  useGetCocktailQuery,
  useAddNewCocktailMutation,
  useEditCocktailMutation,
} = cocktailsApi;

// async actions
export const fetchCocktails = createAsyncThunk(
  "cocktails/fetchCocktails",
  () => {
    // return a Promise containing the data we want
    return fetch(`${process.env.REACT_APP_BACKEND_URL}/cocktails`)
      .then((response) => response.json())
      .then((cocktails) => cocktails);
  }
);

const cocktailsSlice = createSlice({
  name: "cocktails",
  initialState: {
    entities: [], // array of cocktails
    status: "idle", // loading state
  },
  reducers: {
    cocktailAdded(state, action) {
      // using createSlice lets us mutate state!
      state.entities.push(action.payload);
    },
    cocktailUpdated(state, action) {
      const cocktails = state.entities.filter(
        (cocktail) => cocktail.id !== action.payload.id
      );
      cocktails.push(action.payload);
      return {
        ...state,
        ...cocktails,
      };
    },
  }, // async actions to come...
  extraReducers: {
    // handle async action types
    [fetchCocktails.pending](state) {
      state.status = "loading";
    },
    [fetchCocktails.fulfilled](state, action) {
      state.entities = action.payload;
      state.status = "idle";
    },
  },
});

// sync actions added for demo purposes
export const { updateCocktails, cocktailAdded, cocktailUpdated } =
  cocktailsSlice.actions;

export default cocktailsSlice.reducer;
