import { configureStore } from '@reduxjs/toolkit';

import { StoreNames } from './config';
import { default as ChatBoReducers } from './reducers/ChatBoReducers';
import { default as SchedulerReducer } from './reducers/SchedulerReducer';
import { default as UserDetailsReducres } from './reducers/UserDetailsReducres';

const store = configureStore({
    reducer: {
        [StoreNames.SCHEDULER]: SchedulerReducer,
        [StoreNames.CHATBOT]: ChatBoReducers,
        [StoreNames.USER]: UserDetailsReducres,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;

export type StoreState = ReturnType<typeof store.getState>;
