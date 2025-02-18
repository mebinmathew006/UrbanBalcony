import {configureStore } from '@reduxjs/toolkit';
import UserDetailsSlice from './UserDetailsSlice';
const store = configureStore({
    reducer:{
        userDetails: UserDetailsSlice,
    }
})

export default store;