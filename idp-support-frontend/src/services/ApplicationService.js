import { api } from '@api/index';
import { applicationEndpoints } from '@const/endpoints/applicationEndpoints';

export class ApplicationService {
    static async createApplication({ landlordId, message, listingId }) {
        try {
            const res = await api.post(
                applicationEndpoints.APPLICATION,
                JSON.stringify({ landlordId, message, listingId })
            );

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося створити заявку';
            throw new Error(message);
        }
    }

    static async hasPendingApplication({ listingId }) {
        try {
            const res = await api.get(
                applicationEndpoints.HAS_PENDING_APPLICATION.replace(':listingId', listingId)
            );

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати статус аплікації';
            throw new Error(message);
        }
    }

    static async getUserApplications() {
        try {
            const res = await api.get(applicationEndpoints.APPLICATION);

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати статус аплікації';
            throw new Error(message);
        }
    }

    static async changeApplicationStatus(id, status) {
        try {
            const res = await api.patch(
                applicationEndpoints.CHANGE_APPLICATION_STATUS.replace(':id', id),
                { status }
            );

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати статус аплікації';
            throw new Error(message);
        }
    }
}
