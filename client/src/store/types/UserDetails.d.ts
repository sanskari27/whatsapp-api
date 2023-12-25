export type UserDetailsState = {
    name: string;
    phoneNumber: string;
    isSubscribed: boolean;
    canSendMessage: boolean;
    subscriptionExpiration: string;
    userType: 'BUSINESS' | 'PERSONAL';
    paymentRecords: PaymentRecords;
};

export type PaymentRecords = {
    subscriptions: [];
    payments: [];
};
