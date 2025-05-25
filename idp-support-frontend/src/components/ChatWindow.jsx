import { UserOutlined, WarningOutlined } from '@ant-design/icons';
import { baseURL } from '@api/index';
import { ChatService } from '@services/ChatService';
import { useUserStore } from '@store/userStore';
import { Avatar, Button, Tooltip } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { io } from 'socket.io-client';
import { ComplaintModal } from './ComplaintModal';
import { ComplaintService } from '@services/ComplaintService';
import { toast } from 'react-toastify';

function ChatWindow({ chatId, chat, currentUserId, onSuccess, onNewMessage }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const user = useUserStore((state) => state?.user);
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL);
        socket.emit('joinChat', { chatId, userId: currentUserId });

        const fetchMessages = async () => {
            try {
                const res = await ChatService.getMessages(chatId);
                const data = res.data;
                setMessages(data);
            } catch (err) {
                console.error('Помилка при завантаженні повідомлень:', err);
            }
        };
        fetchMessages();

        socket.on('receiveMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.disconnect();
        };
    }, [chatId, currentUserId]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const socket = io(import.meta.env.VITE_API_URL);

        socket.emit('sendMessage', {
            chatId,
            senderId: currentUserId,
            text: newMessage
        });
        onNewMessage({
            chatId,
            senderId: currentUserId,
            content: newMessage
        });

        setNewMessage('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const createComplaint = (values) => {
        setLoading(true);
        ComplaintService.createComplaint({ ...values, chatId, complainantId: currentUserId })
            .then(() => {
                toast('Скарга успішно створена. Модератор незабаром підключиться до чату', {
                    type: 'success'
                });
            })
            .catch(() => {
                toast('Виникла помилка під час створення скарги', { type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    const moderateChat = async () => {
        setLoading(true);
        try {
            await ChatService.markChatInModeration(chatId);
            toast('Вас було призначено модератором цього чату', { type: 'success' });
            onSuccess();
        } catch {
            toast('Виникла помилка під час модерації чату', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const isAskedForModeration =
        chat?.status === 'MODERATOR_REQUESTED' && user?.role === 'Moderator';

    return (
        <div className="chat-window">
            {chat?.listing && (
                <div className="chat-listing-header">
                    <img src={`${baseURL}${chat?.listing?.images[0]}`} height={50} />
                    <div>
                        <Link to={`/listings/${chat?.listing?._id}`} className="listing-title">
                            {chat?.listing?.title}
                        </Link>
                        <div className="listing-description">{chat?.listing?.description}</div>
                    </div>

                    {['IDP', 'Landlord'].includes(user?.role) && (
                        <div
                            style={{
                                alignSelf: 'center',
                                justifySelf: 'flex-end',
                                display: 'block'
                            }}>
                            <Tooltip title="Поскаржитись">
                                <Button
                                    type="text"
                                    icon={<WarningOutlined />}
                                    onClick={() => setOpen(true)}
                                />
                            </Tooltip>
                        </div>
                    )}
                </div>
            )}
            <div className="messages">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`message ${msg.sender._id === currentUserId ? 'own' : 'other'}`}>
                        <Avatar
                            src={msg.sender.avatar && `${baseURL}${msg.sender.avatar}`}
                            icon={!msg.sender.avatar && <UserOutlined />}
                            alt="Аватар користувача"
                            className="avatar"
                        />
                        <div className="message-content">
                            <div className="sender-name">
                                {msg.sender.firstName} {msg.sender.lastName}
                            </div>
                            <div className="message-text">{msg.content}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            {isAskedForModeration ? (
                <Button onClick={moderateChat}>Модерувати чати</Button>
            ) : (
                <form className="chat-input" onSubmit={sendMessage}>
                    <input
                        type="text"
                        placeholder="Введіть повідомлення..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit">Надіслати</button>
                </form>
            )}

            {open && (
                <ComplaintModal
                    type="chat"
                    open={open}
                    loading={loading}
                    onSubmit={createComplaint}
                    onCancel={() => {
                        setOpen(false);
                    }}
                />
            )}
        </div>
    );
}

export default ChatWindow;
