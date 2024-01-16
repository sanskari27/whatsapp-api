import { configureStore } from '@reduxjs/toolkit';

import { StoreNames } from './config';
import { default as AttachmentReducers } from './reducers/AttachmentReducers';
import { default as BotReducers } from './reducers/BotReducers';
import { default as CSVFileReducers } from './reducers/CSVFileReducers';
import { default as ContactCardReducers } from './reducers/ContactCardReducers';
import { default as LinkShortenerReducer } from './reducers/LinkShortnerReducers';
import { default as PollReducers } from './reducers/PollReducers';
import { default as SchedulerReducer } from './reducers/SchedulerReducer';
import { default as UserDetailsReducers } from './reducers/UserDetailsReducers';

const store = configureStore({
    reducer: {
        [StoreNames.SCHEDULER]: SchedulerReducer,
        [StoreNames.CHATBOT]: BotReducers,
        [StoreNames.USER]: UserDetailsReducers,
        [StoreNames.LINK]: LinkShortenerReducer,
        [StoreNames.CONTACT_CARD]: ContactCardReducers,
        [StoreNames.ATTACHMENT]: AttachmentReducers,
        [StoreNames.CSV]: CSVFileReducers,
        [StoreNames.POLL]: PollReducers,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;

export type StoreState = ReturnType<typeof store.getState>;
