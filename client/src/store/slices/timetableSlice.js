import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  timetable: [],
  loading: false,
  error: null,
};

const timetableSlice = createSlice({
  name: 'timetable',
  initialState,
  reducers: {
    fetchTimetableStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTimetableSuccess: (state, action) => {
      state.loading = false;
      state.timetable = action.payload;
    },
    fetchTimetableFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    generateTimetableStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    generateTimetableSuccess: (state) => {
      state.loading = false;
    },
    generateTimetableFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchTimetableStart,
  fetchTimetableSuccess,
  fetchTimetableFailure,
  generateTimetableStart,
  generateTimetableSuccess,
  generateTimetableFailure,
} = timetableSlice.actions;

export default timetableSlice.reducer;
