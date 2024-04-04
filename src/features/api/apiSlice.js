import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

//Define the single API slice object and endpoints
export const apiSlice = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: `${process.env.REACT_APP_BACKEND_URL}`,
		prepareHeaders: (headers, { getState }) => {
			const token = getState().auth.token
			if (token) {
				headers.set('Authorization', `Bearer ${token}`)
			}
			return headers
		},
	}),
	endpoints: () => ({}),
})
