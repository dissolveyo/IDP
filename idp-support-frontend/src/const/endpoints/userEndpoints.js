const BASE_URL = 'api/users';

export const USER_ENDPOINTS = {
    LOGIN: `${BASE_URL}/login`,
    REGISTER: `${BASE_URL}/register`,
    SESSION: `${BASE_URL}/session`,
    UPDATE_PROFILE: `${BASE_URL}/profile`,
    MODERATORS: `${BASE_URL}/moderators`,
    ACTIVATE_PASSWORD: `${BASE_URL}/activate-password/:token`,
    RESEND_ACTIVATE_PASSWORD_LINK: `${BASE_URL}/moderators/:id/resend-activation`
};
