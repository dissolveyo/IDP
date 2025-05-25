import { api } from '../api';
import { analyticsEndpoints } from '@const/endpoints/analyticsEndpoints';

export class AnalyticsService {
    static async getAnalyticsByType(type) {
        try {
            const res = await api.get(analyticsEndpoints.BY_TYPE.replace(':type', type));

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати аналітику';
            throw new Error(message);
        }
    }
}
