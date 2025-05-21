import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchApiConfig = createAsyncThunk(
  'apiConfig/fetch',
  async (userId) => {
    const res = await fetch(`http://localhost:5000/api/openai/${userId}`);
    const data = await res.json();
    return data;
  }
);

export const saveApiConfig = createAsyncThunk(
  'apiConfig/save',
  async ({ userId, config }) => {
    await fetch(`http://localhost:5000/api/openai/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...config }),
    });
    return config;
  }
);


const apiConfigSlice = createSlice({
  name: 'apiConfig',
  initialState: {
    config: {},
    provider: '',
    loading: false,
    error: null,
  },
  reducers: {
    setapiConfig: (state, action) => {
      state.config = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApiConfig.fulfilled, (state, action) => {
        state.config = action.payload.config;
        state.provider = action.payload.provider;
        state.loading = false;
      })
      .addCase(saveApiConfig.fulfilled, (state, action) => {
        state.config = action.payload.config;
        state.provider = action.payload.provider;
      });
  },
});
export const { setapiConfig } = apiConfigSlice.actions;

export default apiConfigSlice.reducer;
