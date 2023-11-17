import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


//Define the single API slice object and endpoints
export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: `${process.env.REACT_APP_BACKEND_URL}` }),
    endpoints: () => ({})
})