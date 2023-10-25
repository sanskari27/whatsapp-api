export const ROUTES = {
    INITIATE_RAZORPAY_PAYMENT: "/api/razorpay/initiate-payment",
    HOME: "/",
    PRIVACY_POLICY: "/privacy-policy",
    PRICE: "/price",
    PAYMENT: ":plan",
    TERMS_AND_CONDITIONS: "/terms-and-conditions",
};

export const THEME = {
    THEME_GREEN: "#4CB072",
};

export const PLAN_TYPE = {
    GOLD: "gold",
    SILVER: "silver",
    PLATINUM: "platinum",
    GOLD_YEARLY: "gold-yearly",
    SILVER_YEARLY: "silver-yearly",
    PLATINUM_YEARLY: "platinum-yearly",
};
export const APP_URL = "https://www.whatsleads.in";
export const SERVER_URL = "https://api.whatsleads.in";
// export const APP_URL = 'http://localhost:8282';
// export const SERVER_URL = 'http://localhost:8282';
export const RAZORPAY_KEY_ID = import.meta.env.RAZORPAY_KEY_ID;
