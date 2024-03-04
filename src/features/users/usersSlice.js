import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";

const usersAdapter = createEntityAdapter();

const initialState = usersAdapter.getInitialState();

export const usersApi = apiSlice.injectEndpoints({
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => `/users`,
      transformResponse: (res) => {
        return usersAdapter.setAll(initialState, res);
      },
      providesTags: (result) =>
        result?.ids
          ? [
              ...result.ids.map(({ id }) => ({ type: "User", id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;

//Calling the endpoint with `select(someArg)` will generate a selector function that will return the query result for a query with such parameter.
export const selectUsersResult = usersApi.endpoints.getUsers.select();

// generate memoized selector with `createSelector` from `reselect` library
const selectUsersData = createSelector(
  selectUsersResult,
  (usersResult) => usersResult.data
);

export const { selectById: selectUserById } = usersAdapter.getSelectors(
  (state) => selectUsersData(state) ?? initialState
);
