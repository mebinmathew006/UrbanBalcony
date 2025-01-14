import { createSlice } from "@reduxjs/toolkit";

 const UserDetailsSlice = createSlice({
  name: "userDetails",
  initialState: {
    id: "",
    first_name: "",
    last_name: "",
    is_admin: "",
    profile_picture: "",
    access_token:'',
  },
  reducers: {
    setUserDetails: (state, action) => {
      state.id = action.payload.id;
      state.first_name = action.payload.first_name;
      state.last_name = action.payload.last_name;
      state.is_admin = action.payload.is_admin;
      state.profile_picture = action.payload.profile_picture;
      state.access_token = action.payload.access_token
    },

    destroyDetails: (state) => {
      state.id = "";
      state.first_name = "";
      state.last_name = "";
      state.is_admin = "";
      state.profile_picture = "";
      state.access_token = "";
    },
  },
});
export const { setUserDetails, destroyDetails } = UserDetailsSlice.actions;

export default UserDetailsSlice.reducer;
