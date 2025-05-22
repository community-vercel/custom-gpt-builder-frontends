import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  nodes: [],
  edges: [],
  flows: [],
  currentFlowId: null,
  status: 'idle',
  error: null
};

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with a status code outside 2xx
    return {
      message: error.response.data?.message || 'Request failed',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request was made but no response received
    return { message: 'No response from server', status: 0 };
  }
  // Something happened in setting up the request
  return { message: error.message || 'Unknown error', status: 0 };
};

// Async thunks
export const saveFlow = createAsyncThunk(
  'flow/saveFlow',
  async ({ userId, nodes, edges, flowName, websiteDomain }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/flow/${userId}`, {
        nodes,
        edges,
        flowName: flowName || `Flow-${Date.now()}`,
        websiteDomain
      });
      return response.data;
    } catch (error) {
      const errorInfo = handleApiError(error);
      if (errorInfo.message.includes('duplicate key')) {
        return rejectWithValue('A flow already exists for this website domain or flow name.');
      }
      return rejectWithValue(errorInfo.message);
    }
  }
);
export const loadFlows = createAsyncThunk(
  'flow/loadFlows',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/flow/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);
export const loadFlows2 = createAsyncThunk(
  'flow/loadFlows',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/flow/user/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);

export const loadFlow = createAsyncThunk(
  'flow/loadFlow',
  async ({ userId, flowId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/flow/${userId}/${flowId}`);
      // Normalize edges data
      const edges = (response.data.edges || []).map(edge => ({
        ...edge,
        id: edge.id || `edge-${edge.source}-${edge.target}-${Date.now()}`,
        sourceHandle: edge.sourceHandle || null,
        targetHandle: edge.targetHandle || null,
        type: edge.type || 'default',
        animated: edge.animated !== undefined ? edge.animated : true
      }));
      return { ...response.data, edges };
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);
export const updateFlow = createAsyncThunk(
  'flow/updateFlow',
  async ({ userId, flowId, nodes, edges, websiteDomain }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/flow/${userId}/${flowId}`, {
        nodes,
        edges,
        websiteDomain
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);

export const deleteFlow = createAsyncThunk(
  'flow/deleteFlow',
  async ({ userId, flowId }, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:5000/api/flow/${userId}/${flowId}`);
      return flowId;
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);


const flowBuilderSlice = createSlice({
  name: 'flowBuilder',
  initialState,
  reducers: {
    setNodes: (state, action) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action) => {
      state.edges = action.payload;
    },
    updateNode: (state, action) => {
      const { id, data } = action.payload;
      const nodeIndex = state.nodes.findIndex(node => node.id === id);
      if (nodeIndex >= 0) {
        state.nodes[nodeIndex] = {
          ...state.nodes[nodeIndex],
          data: {
            ...state.nodes[nodeIndex].data,
            ...data
          }
        };
      }
    },
    addNode: (state, action) => {
      state.nodes.push(action.payload);
    },
    clearFlow: (state) => {
      state.nodes = [];
      state.edges = [];
      state.currentFlowId = null;
      state.status = 'idle';
      state.error = null;
    },
    setCurrentFlow: (state, action) => {
      state.currentFlowId = action.payload;
    },
    resetFlowState: () => initialState
  },
     setWebsiteDomain: (state, action) => {
      state.websiteDomain = action.payload;
    },
  extraReducers: (builder) => {
    builder
      .addCase(saveFlow.pending, (state) => {
        state.status = 'saving';
        state.error = null;
      })
      .addCase(saveFlow.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentFlowId = action.payload._id;
        // Update flows list
        const existingIndex = state.flows.findIndex(flow => flow._id === action.payload._id);
        if (existingIndex >= 0) {
          state.flows[existingIndex] = action.payload;
        } else {
          state.flows.push(action.payload);
        }
      })
      .addCase(saveFlow.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loadFlows2.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadFlows2.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.flows = action.payload;
      })
      .addCase(loadFlows2.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loadFlow.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadFlow.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.nodes = action.payload.nodes || [];
        state.edges = action.payload.edges || [];
        state.currentFlowId = action.payload._id;
                state.flowName = action.payload.flowName; // Load websiteDomain

                state.websiteDomain = action.payload.websiteDomain; // Load websiteDomain

      })
      .addCase(loadFlow.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateFlow.pending, (state) => {
        state.status = 'updating';
        state.error = null;
      })
      .addCase(updateFlow.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update in flows list
        const index = state.flows.findIndex(flow => flow._id === action.payload._id);
        if (index >= 0) {
          state.flows[index] = action.payload;
        }
        // Update current flow if it's the one being updated
        if (state.currentFlowId === action.payload._id) {
          state.nodes = action.payload.nodes || [];
          state.edges = action.payload.edges || [];
                    state.websiteDomain = action.payload.websiteDomain; // Update websiteDomain

        }
      })
      .addCase(updateFlow.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteFlow.pending, (state) => {
        state.status = 'deleting';
        state.error = null;
      })
      .addCase(deleteFlow.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.flows = state.flows.filter(flow => flow._id !== action.payload);
        if (state.currentFlowId === action.payload) {
          state.nodes = [];
          state.edges = [];
          state.currentFlowId = null;
        }
      })
      .addCase(deleteFlow.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const {
  setNodes,
  setEdges,
  updateNode,
  addNode,
  clearFlow,
  setCurrentFlow,
  resetFlowState,
    setWebsiteDomain
} = flowBuilderSlice.actions;

export default flowBuilderSlice.reducer;