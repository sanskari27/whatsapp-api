import { configureStore } from '@reduxjs/toolkit';

import { StoreNames } from './config';
import { default as UserDetailsReducers } from './reducers/UserDetailsReducers';

const store = configureStore({
	reducer: {
		[StoreNames.USER]: UserDetailsReducers,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export default store;

export type StoreState = ReturnType<typeof store.getState>;
