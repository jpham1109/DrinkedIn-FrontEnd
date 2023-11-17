import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../features/api/apiSlice.js";
import cocktailsReducer from "../features/cocktails/cocktailsSlice.js";
import userReducer from "../features/user/userSlice.js";

const store = configureStore({
  reducer: {
    user: userReducer,
    cocktails: cocktailsReducer,
    // Add the generated reducer as a specific top-level slice
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling, and other features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;
