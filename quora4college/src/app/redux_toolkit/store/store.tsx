import { configureStore } from "@reduxjs/toolkit";
import attributes from "../slices/stateSlice"
import { useDispatch } from "react-redux";
export const store = configureStore({
  reducer: {
   attributes: attributes
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
