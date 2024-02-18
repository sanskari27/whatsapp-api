import { configureStore } from '@reduxjs/toolkit';

import { StoreNames } from './config';
import { default as UsersReducer } from './reducers/UsersReducer';
import {default as PaymentReducers} from './reducers/PaymentReducers';
import { default as AdminReducers } from './reducers/AdminReducers';

const store = configureStore({
	reducer: {
		[StoreNames.USERS]: UsersReducer,
		[StoreNames.PAYMENTS]: PaymentReducers,
		[StoreNames.ADMIN]: AdminReducers,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export default store;

export type StoreState = ReturnType<typeof store.getState>;
