const BASE_URL = 'api/ratings';

export const ratingEndpoints = {
    RATINGS_BY_LISTING: `${BASE_URL}/listing/:listingId`,
    IS_ALLOWED_TO_RATE: `${BASE_URL}/allowed`,
    RATING: `${BASE_URL}/`
};
