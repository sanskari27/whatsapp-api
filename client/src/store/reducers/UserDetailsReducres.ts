import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { UserDetailsState } from '../types/UserDetails';

const initialState: UserDetailsState = {
    name: '',
    phoneNumber: '',
    isSubscribed: false,
    subscriptionExpiration: '',
    userType: 'PERSONAL',
    canSendMessage: false,
    paymentRecords: {
        subscriptions: [],
        payments: [],
    },
};

const UserDetailsSlice = createSlice({
    name: StoreNames.USER,
    initialState,
    reducers: {
        reset: (state) => {
            state.name = initialState.name;
            state.phoneNumber = initialState.phoneNumber;
            state.isSubscribed = initialState.isSubscribed;
            state.subscriptionExpiration = initialState.subscriptionExpiration;
            state.userType = initialState.userType;
            state.paymentRecords = initialState.paymentRecords;
        },
        setUserDetails: (state, action: PayloadAction<typeof initialState>) => {
            state.name = action.payload.name;
            state.phoneNumber = action.payload.phoneNumber;
            state.isSubscribed = action.payload.isSubscribed;
            state.subscriptionExpiration =
                action.payload.subscriptionExpiration;
            state.userType = action.payload.userType;
            state.paymentRecords = action.payload.paymentRecords;
        },
        setName: (state, action: PayloadAction<typeof initialState.name>) => {
            state.name = action.payload;
        },
        setPhoneNumber: (
            state,
            action: PayloadAction<typeof initialState.phoneNumber>
        ) => {
            state.phoneNumber = action.payload;
        },
        setIsSubscribed: (
            state,
            action: PayloadAction<typeof initialState.isSubscribed>
        ) => {
            state.isSubscribed = action.payload;
        },
        setSubscriptionExpiration: (
            state,
            action: PayloadAction<typeof initialState.subscriptionExpiration>
        ) => {
            state.subscriptionExpiration = action.payload;
        },
        setUserType: (
            state,
            action: PayloadAction<typeof initialState.userType>
        ) => {
            state.userType = action.payload;
        },
        setPaymentRecords: (
            state,
            action: PayloadAction<typeof initialState.paymentRecords>
        ) => {
            state.paymentRecords = action.payload;
        },
    },
});

export const {
    reset,
    setUserDetails,
    setName,
    setPhoneNumber,
    setIsSubscribed,
    setSubscriptionExpiration,
    setUserType,
    setPaymentRecords,
} = UserDetailsSlice.actions;

export default UserDetailsSlice.reducer;
