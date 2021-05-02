import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Action Creators

// async actions
export const fetchCocktails = createAsyncThunk("cocktails/fetchCocktails", () => {
  // return a Promise containing the data we want
  return fetch("http://localhost:7000/cocktails")
    .then((response) => response.json())
    .then((cocktails) => cocktails );
});


// Reducer

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
      const cocktail = state.entities.find((cocktail) => cocktail.id === action.payload.id);
    //   cat.url = action.payload.url;
    },
    // async actions to come...
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
  },
});

// sync actions added for demo purposes
export const { cocktailAdded, cocktailUpdated } = cocktailsSlice.actions;

export default cocktailsSlice.reducer;