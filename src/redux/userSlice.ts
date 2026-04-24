import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    [key: string]: unknown; // Allow for other fields for now
}

interface UserState {
    userdata: UserData | null;
}

const initialState: UserState = {
    userdata: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserData | null>) => {
            state.userdata = action.payload;
        },
    },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;