import { api } from '@api/index';
import { chatEndpoints } from '@const/endpoints/chatEndpoints';

export class ChatService {
    static async createChat(data) {
        try {
            const res = await api.post(chatEndpoints.CHATS, JSON.stringify(data));

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося створити чат';
            throw new Error(message);
        }
    }

    static async getMessages(id) {
        try {
            const res = await api.get(chatEndpoints.GET_MESSAGE.replace(':chatId', id));

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати повідомлення';
            throw new Error(message);
        }
    }

    static async getChats() {
        try {
            const res = await api.get(chatEndpoints.CHATS);

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати повідомлення';
            throw new Error(message);
        }
    }

    static async getModeratorRequestedChats() {
        try {
            const res = await api.get(chatEndpoints.MODERATOR_REQUESTED);

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося отримати повідомлення';
            throw new Error(message);
        }
    }

    static async markChatInModeration(chatId) {
        try {
            const res = await api.patch(
                chatEndpoints.MARK_CHAT_IN_MODERATION.replace(':id', chatId)
            );

            return res;
        } catch (err) {
            const message = err.response?.data?.message || 'Не вдалося оновити чат';
            throw new Error(message);
        }
    }
}
