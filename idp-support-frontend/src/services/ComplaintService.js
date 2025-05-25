import { api } from '@api/index';
import { complaintEndpoints } from '@const/endpoints/complaintEndpoints';

export class ComplaintService {
    static async createComplaint(data) {
        try {
            const res = await api.post(complaintEndpoints.COMPLAINT, JSON.stringify(data));

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося створити скаргу';
            throw new Error(message);
        }
    }

    static async getAllComplaints() {
        try {
            const res = await api.get(complaintEndpoints.COMPLAINT);

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати скарги';
            throw new Error(message);
        }
    }

    static async updateStatus(id, status) {
        try {
            const res = await api.put(
                complaintEndpoints.UPDATE_STATUS.replace(':id', id),
                JSON.stringify({ status })
            );

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося оновити скарги';
            throw new Error(message);
        }
    }
}
