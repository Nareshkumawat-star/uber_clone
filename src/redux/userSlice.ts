import { createSlice } from "@reduxjs/toolkit";

interface Iuserstate {
    userdata:number|null
}
const intialstate:Iuserstate = {
    userdata: null,
}
const userSlice = createSlice({
    name: "user",
    initialState: intialstate,
    reducers: {
        setUser: (state, action) => {
            state.userdata = action.payload
        }
    }
})

export const { setUser } = userSlice.actions
export default userSlice.reducer