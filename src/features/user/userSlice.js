import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  tagTypes: ["User"],
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: `/login`,
        method: "POST",
        body: credentials,
      }),
    }),
    signupUser: builder.mutation({
      query: (body) => ({
        url: `/signup`,
        method: "POST",
        body,
      }),
    }),
    getUser: builder.query({
      query: () => ({
        url: `/me`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: localStorage.token,
        },
      }),
    }),
    editUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/me`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useSignupUserMutation,
  useGetUserQuery,
  useEditUserMutation,
  useDeleteUserMutation,
} = userApi;

const userToken = localStorage.getItem("token")
  ? localStorage.getItem("token")
  : null;
const initialState = {
  user: null,
  token: userToken,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
      };
    },
    updateUser: (state, action) => {
      return {
        ...state,
        user: action.payload.user,
      };
    },

    addUserCocktail: (state, action) => {
      state.cocktails.push(action.payload);
    },

    addUserLike: (state, action) => {
      state.likes.push(action.payload);
    },

    deleteUserLike: (state, action) => {
      const likes = state.user.likes.filter(
        (like) => like.id !== action.payload.id
      );
      return {
        ...state,
        ...likes,
      };
    },

    addUserFollow: (state, action) => {
      state.followed_users.push(action.payload);
    },

    deleteUserFollow: (state, action) => {
      const follows = state.followed_users.filter(
        (follow) => follow.id !== action.payload.id
      );
      return {
        ...state,
        ...follows,
      };
    },

    deleteUserFollowing: (state, action) => {
      debugger;
      const followings = state.following_users.filter(
        (following) => following.id !== action.payload.id
      );
      return {
        ...state,
        ...followings,
      };
    },
    updateUserCocktail: (state, action) => {
      const cocktails = state.cocktails.map((cocktail) => {
        if (cocktail.id === action.payload.id) {
          return action.payload;
        } else {
          return cocktail;
        }
      });
      return cocktails;
    },

    deleteUserCocktail: (state, action) => {
      const cocktails = state.cocktails.filter(
        (cocktail) => cocktail.id !== action.payload
      );
      return {
        ...state,
        ...cocktails,
      };
    },

    logoutUser: (state) => {
      return {
        ...state,
        user: null,
        token: null,
      };
    },
  },
});

export const {
  setCurrentUser,
  updateUser,
  deleteUserLike,
  logoutUser,
  addUserFollow,
  deleteUserFollow,
  deleteUserFollowing,
  addUserLike,
  addUserCocktail,
  updateUserCocktail,
  deleteUserCocktail,
} = userSlice.actions;

export default userSlice.reducer;

export const selectCurrentUser = (state) => state.user.user;
export const selectUserToken = (state) => state.user.token;
// Select all the bars that the current user work for
export const selectUserBars = (state) => state.user.user.bars ?? [];
// Select all the cocktails that the current user has created
export const selectUserCocktails = (state) => state.user.user.cocktails;
// Select all the cocktails that the current user has liked
export const selectUserLikes = (state) => state.user.user.likes;
// Select all the users that are following the current user
export const selectUserFollowers = (state) => state.user.user.following_users;
// Select all the users that the current user is following
export const selectUserFollowings = (state) => state.user.user.followed_users;
