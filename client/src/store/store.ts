import { configureStore } from '@reduxjs/toolkit';

import { StoreNames } from './config';
import { default as SchedulerReducer } from './reducers/SchedulerReducer';

const store = configureStore({
	reducer: {
		[StoreNames.SCHEDULER]: SchedulerReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export default store;

export type StoreState = ReturnType<typeof store.getState>;
