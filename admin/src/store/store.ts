import { configureStore } from '@reduxjs/toolkit';

import { StoreNames } from './config';
import { default as UserDetailsReducers } from './reducers/UserDetailsReducers';
import { default as UsersReducer } from './reducers/UsersReducer';

const store = configureStore({
	reducer: {
		[StoreNames.USER]: UserDetailsReducers,
		[StoreNames.USERS]: UsersReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export default store;

export type StoreState = ReturnType<typeof store.getState>;
