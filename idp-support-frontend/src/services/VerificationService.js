import { api } from '@api/index';
import { VERIFICATION_ENDPOINTS } from '@const/endpoints';

export class VerificationService {
    static async createVerification(formData) {
        try {
            const res = await api.post(VERIFICATION_ENDPOINTS.VERIFICATION, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return res.data;
        } catch (err) {
            console.error('Помилка при відправці форми', err);
            throw err;
        }
    }

    static async getPersonalVerifications() {
        try {
            const res = await api.get(VERIFICATION_ENDPOINTS.PERSONAL_VERIFICATIONS);

            return res.data;
        } catch (err) {
            console.error('Помилка при відправці форми', err);
            throw err;
        }
    }

    static async getAllVerifications() {
        try {
            const res = await api.get(VERIFICATION_ENDPOINTS.VERIFICATION);

            return res.data;
        } catch (err) {
            console.error('Помилка при отриманні верифікацій', err);
            throw err;
        }
    }

    static async getVerificationById(id) {
        try {
            const res = await api.get(`${VERIFICATION_ENDPOINTS.VERIFICATION}/${id}`);

            return res.data;
        } catch (err) {
            console.error('Помилка при отриманні верифікацій', err);
            throw err;
        }
    }

    static async updateVerificationStatus(id, { status, declineReason }) {
        try {
            const res = await api.patch(
                `${VERIFICATION_ENDPOINTS.UPDATE_VERIFICATION}`.replace(':id', id),
                { status, declineReason }
            );

            return res.data;
        } catch (err) {
            console.error('Помилка при отриманні верифікацій', err);
            throw err;
        }
    }
}
