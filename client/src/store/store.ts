import { configureStore } from '@reduxjs/toolkit';

import { StoreNames } from './config';
import { default as AttachmentReduers } from './reducers/AttachmentReducers';
import { default as ChatBoReducers } from './reducers/ChatBoReducers';
import { default as ContactCardReducres } from './reducers/ContactCardReducers';
import { default as LinkShortenerReducer } from './reducers/LinkShortnerReducers';
import { default as SchedulerReducer } from './reducers/SchedulerReducer';
import { default as UserDetailsReducres } from './reducers/UserDetailsReducres';

const store = configureStore({
    reducer: {
        [StoreNames.SCHEDULER]: SchedulerReducer,
        [StoreNames.CHATBOT]: ChatBoReducers,
        [StoreNames.USER]: UserDetailsReducres,
        [StoreNames.LINK]: LinkShortenerReducer,
        [StoreNames.CONTACT_CARD]: ContactCardReducres,
        [StoreNames.ATTACHMENT]: AttachmentReduers,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;

export type StoreState = ReturnType<typeof store.getState>;
