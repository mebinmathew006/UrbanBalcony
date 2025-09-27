import {combineReducers, configureStore } from '@reduxjs/toolkit';
import UserDetailsSlice from './UserDetailsSlice';
import storage from 'redux-persist/lib/storage'; 
import { persistStore, persistReducer } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['userDetails']
};

const rootReducer = combineReducers({
  userDetails: UserDetailsSlice,
  
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // disable check for redux-persist
    }),
});
export const persistor = persistStore(store);

export default store;