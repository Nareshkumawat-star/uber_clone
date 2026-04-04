import { configureStore } from "@reduxjs/toolkit";
import usereducer from "./userSlice"
export const store = configureStore({
    reducer: {
        user:usereducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
