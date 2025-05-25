import { useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { socket } from '../socket';
import { baseURL } from '@api/index';
import { useChatStore } from '@store/chatStore';

export function NotificationHandler({ userId }) {
    const incrementCount = useChatStore((state) => state.incrementCount);

    useEffect(() => {
        const handleReceiveMessage = (message) => {
            const isInChat = window.location.pathname.startsWith(`/chats/${message.chatId}`);
            if (isInChat) return;

            const audio = new Audio('/assets/message.mp3');
            audio.play().catch();

            toast(
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {message.sender?.avatar && (
                        <img
                            src={`${baseURL}${message.sender.avatar}`}
                            alt="avatar"
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                marginRight: 10,
                                objectFit: 'cover'
                            }}
                        />
                    )}
                    <div>
                        <strong>
                            {message.sender?.firstName} {message.sender?.lastName}:
                        </strong>{' '}
                        {message.content}
                    </div>
                </div>,
                { position: 'top-right', autoClose: 5000, type: 'info' }
            );
            incrementCount();
        };

        if (userId) {
            socket.emit('joinUser', { userId });
            socket.on('receiveMessage', handleReceiveMessage);
        }

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [userId]);

    return null;
}
export default NotificationHandler;
