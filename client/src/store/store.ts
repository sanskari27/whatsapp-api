import { configureStore } from '@reduxjs/toolkit';

import { StoreNames } from './config';
import ChatBoReducers from './reducers/ChatBoReducers';
import { default as SchedulerReducer } from './reducers/SchedulerReducer';

const store = configureStore({
    reducer: {
        [StoreNames.SCHEDULER]: SchedulerReducer,
        [StoreNames.CHATBOT]: ChatBoReducers,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;

export type StoreState = ReturnType<typeof store.getState>;
