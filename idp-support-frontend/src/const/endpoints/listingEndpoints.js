const BASE_URL = 'api/listings';

export const LISTING_ENDPOINTS = {
    LISTING: `${BASE_URL}/`,
    LISTING_BY_ID: `${BASE_URL}/:id`,
    MY_LISTINGS: `${BASE_URL}/personal-listings`,
    TOGGLE_LISTING_STATUS: `${BASE_URL}/:id/toggle-status`,
    ACTIVE_LISTING: `${BASE_URL}/listings/active`,
    SUSPEND_LISTING: `${BASE_URL}/:id/suspend`,
    ACTIVATE_LISTING: `${BASE_URL}/:id/activate`
};
