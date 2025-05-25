import { api } from '../api';

export class FileService {
    static async getVerificationFile(filePath) {
        try {
            const res = await api.get(filePath, { responseType: 'blob' });

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати файл посилання';
            throw new Error(message);
        }
    }
}
