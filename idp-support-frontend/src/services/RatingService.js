import { api } from '@api/index';
import { ratingEndpoints } from '@const/endpoints/ratingEndpoints';

export class RatingService {
    static async getRatingsByListing(listingId) {
        try {
            const res = await api.get(
                ratingEndpoints.RATINGS_BY_LISTING.replace(':listingId', listingId)
            );

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати рейтинги';
            throw new Error(message);
        }
    }

    static async createRating({ listingId, score, comment }) {
        try {
            const res = await api.post(
                ratingEndpoints.RATING,
                JSON.stringify({ listingId, score, comment })
            );

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати рейтинги';
            throw new Error(message);
        }
    }

    static async getIsAllowedToRate(listingId) {
        try {
            const res = await api.post(ratingEndpoints.IS_ALLOWED_TO_RATE, listingId);

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати рейтинги';
            throw new Error(message);
        }
    }

    static async updateRating({ id, score, comment }) {
        try {
            const res = await api.put(
                `${ratingEndpoints.RATING}${id}`,
                JSON.stringify({ score, comment })
            );

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося оновити рейтинг';
            throw new Error(message);
        }
    }

    static async deleteRating(id) {
        try {
            const res = await api.delete(`${ratingEndpoints.RATING}${id}`);

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося видалити рейтинг';
            throw new Error(message);
        }
    }
}
