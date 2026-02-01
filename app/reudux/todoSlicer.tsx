import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


export interface Todo {
  id: number;
  title: string;
  description?: string;
}

interface TodoState {
  isLoading: boolean;
  data: Todo[] | null;
  error: boolean;
}

const initialState: TodoState = {
  isLoading: false,
  data: null,
  error: false,
};

export const fetchTodo = createAsyncThunk<Todo[]>(
  "fetchTodo",
  async () => {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/cards?page=1&limit=5`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch todos");
    }

    return response.json();
  }
);

/* =======================
   Slice
======================= */
const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodo.pending, (state) => {
        state.isLoading = true;
        state.error = false;
      })
      .addCase(
        fetchTodo.fulfilled,
        (state, action: PayloadAction<Todo[]>) => {
          state.isLoading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchTodo.rejected, (state) => {
        state.isLoading = false;
        state.error = true;
      });
  },
});

export default todoSlice.reducer;
