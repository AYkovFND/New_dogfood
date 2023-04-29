import { createAsyncThunk } from "@reduxjs/toolkit";

export const getSearchQueryThunk = createAsyncThunk(
    'products/getSearchQueryThunk', 
    async function({searchQuary, token}, {rejectWithValue, fulfillWithValue, dispatch, getState, extra: api}) {
        try {
            const data = await api.search(searchQuary, token);
            return fulfillWithValue(data);
        } catch (e) {
            return rejectWithValue(e);
        }
})