import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Action Creators

// async actions
export const fetchCategories = createAsyncThunk("categories/fetchCategories", () => {
  // return a Promise containing the data we want
  return fetch("http://localhost:7000/categories")
    .then((response) => response.json())
    .then((categories) => categories );
});


// Reducer

const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    entities: [], // array of categories
    status: "idle", // loading state
  },
  extraReducers: {
      // handle async action types
      [fetchCategories.pending](state) {
        state.status = "loading";
      },
      [fetchCategories.fulfilled](state, action) {
        console.log(action.payload, "categories payload")
        state.entities = action.payload;
        state.status = "idle";
      },
    },
});

// sync actions added for demo purposes
// export const fetchCategories = categoriesSlice.actions;

export default categoriesSlice.reducer;