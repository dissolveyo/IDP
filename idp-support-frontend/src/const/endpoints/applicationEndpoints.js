const BASE_URL = '/api/applications';

export const applicationEndpoints = {
    APPLICATION: `${BASE_URL}/`,
    CHANGE_APPLICATION_STATUS: `${BASE_URL}/:id/status`,
    HAS_PENDING_APPLICATION: `${BASE_URL}/has-pending/:listingId`
};
