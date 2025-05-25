const BASE_URL = '/api/chats';

export const chatEndpoints = {
    CHATS: `${BASE_URL}/`,
    GET_MESSAGE: `${BASE_URL}/messages/:chatId`,
    MODERATOR_REQUESTED: `${BASE_URL}/moderator-requested`,
    MARK_CHAT_IN_MODERATION: `${BASE_URL}/:id/in-moderation`
};
