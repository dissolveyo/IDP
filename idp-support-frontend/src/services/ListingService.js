import { api } from '@api/index';
import { LISTING_ENDPOINTS } from '@const/endpoints/listingEndpoints';

export class ListingService {
    static async createListing(data) {
        try {
            const res = await api.post(LISTING_ENDPOINTS.LISTING, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося створити оголошення';
            throw new Error(message);
        }
    }

    static async updateListing(id, data) {
        try {
            const res = await api.put(LISTING_ENDPOINTS.LISTING_BY_ID.replace(':id', id), data);

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося оновити оголошення';
            throw new Error(message);
        }
    }

    static async getListingById(id) {
        try {
            const res = await api.get(LISTING_ENDPOINTS.LISTING_BY_ID.replace(':id', id));

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати оголошення';
            throw new Error(message);
        }
    }

    static async getMyListings() {
        try {
            const res = await api.get(LISTING_ENDPOINTS.MY_LISTINGS);

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати оголошення';
            throw new Error(message);
        }
    }

    static async deleteListingById(id) {
        try {
            const res = await api.delete(LISTING_ENDPOINTS.LISTING_BY_ID.replace(':id', id));

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати оголошення';
            throw new Error(message);
        }
    }

    static async toggleListingsStatus(id) {
        try {
            const res = await api.patch(LISTING_ENDPOINTS.TOGGLE_LISTING_STATUS.replace(':id', id));

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати оголошення';
            throw new Error(message);
        }
    }

    static async getAllActiveListings() {
        try {
            const res = await api.get(LISTING_ENDPOINTS.ACTIVE_LISTING);

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати оголошення';
            throw new Error(message);
        }
    }

    static async suspendListing(id) {
        try {
            const res = await api.patch(LISTING_ENDPOINTS.SUSPEND_LISTING.replace(':id', id));

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати оголошення';
            throw new Error(message);
        }
    }

    static async activateListing(id) {
        try {
            const res = await api.patch(LISTING_ENDPOINTS.ACTIVATE_LISTING.replace(':id', id));

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати оголошення';
            throw new Error(message);
        }
    }
}
