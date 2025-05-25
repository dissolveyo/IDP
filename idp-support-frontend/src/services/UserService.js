import { USER_ENDPOINTS } from '../const/endpoints';
import { api } from '../api';

export class UserService {
    static async login({ email, password }) {
        try {
            const res = await api.post(USER_ENDPOINTS.LOGIN, JSON.stringify({ email, password }));
            return res.data;
        } catch (e) {
            const message = e?.response?.data?.message || e?.message || 'Помилка логінку';
            throw new Error(message);
        }
    }
    static async register({ firstName, lastName, email, password, role }) {
        try {
            const res = await api.post(
                USER_ENDPOINTS.REGISTER,
                JSON.stringify({ firstName, lastName, email, password, role })
            );
            return res.data
        } catch (e) {
            const message = e?.response?.data?.message || e?.message || 'Помилка реєстрації';

            throw new Error(message);
        }
    }

    static async getSession() {
        try {
            const res = await api.get(USER_ENDPOINTS.SESSION);
            return res.data;
        } catch {
            localStorage.removeItem('token');
            throw new Error('Сесія завершена');
        }
    }

    static async updateProfile({ firstName, lastName }) {
        try {
            const res = await api.patch(
                USER_ENDPOINTS.UPDATE_PROFILE,
                JSON.stringify({
                    firstName,
                    lastName
                })
            );

            return res.data.user;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося оновити профіль';
            throw new Error(message);
        }
    }

    static async createModerator({ firstName, lastName, email }) {
        try {
            const res = await api.post(
                USER_ENDPOINTS.MODERATORS,
                JSON.stringify({
                    firstName,
                    lastName,
                    email
                })
            );

            return res.data?.moderator;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося створити модератора ';
            throw new Error(message);
        }
    }

    static async updateModeratorBySuperUser(id, { firstName, lastName }) {
        try {
            const res = await api.put(
                `${USER_ENDPOINTS.MODERATORS}/${id}`,
                JSON.stringify({
                    firstName,
                    lastName
                })
            );

            return res.data?.moderator;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося оновити модератора ';
            throw new Error(message);
        }
    }

    static async getModeratos() {
        try {
            const res = await api.get(USER_ENDPOINTS.MODERATORS);

            return res.data.moderators;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати модераторів';
            throw new Error(message);
        }
    }
    static async getModeratorById(id) {
        try {
            const res = await api.get(`${USER_ENDPOINTS.MODERATORS}/${id}`);

            return res.data.moderator;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати модератора';
            throw new Error(message);
        }
    }
    static async deleteModeratorById(id) {
        try {
            const res = await api.delete(`${USER_ENDPOINTS.MODERATORS}/${id}`);

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося видалити модератора';
            throw new Error(message);
        }
    }

    static async activatePassword({ password, token }) {
        try {
            const res = await api.post(
                USER_ENDPOINTS.ACTIVATE_PASSWORD.replace(':token', token),
                JSON.stringify({ password })
            );

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося створити модератора ';
            throw new Error(message);
        }
    }

    static async resendActivatePasswordLink(id) {
        try {
            const res = await api.post(
                USER_ENDPOINTS.RESEND_ACTIVATE_PASSWORD_LINK.replace(':id', id)
            );

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося надіслати посилання';
            throw new Error(message);
        }
    }
}
