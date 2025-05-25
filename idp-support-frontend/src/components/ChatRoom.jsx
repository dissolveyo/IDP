import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatRoom = ({ chatId, userId }) => {
    const [messages, setMessages] = useState([]);
    const [newText, setNewText] = useState('');

    useEffect(() => {
        socket.emit('joinChat', { chatId, userId });

        socket.on('receiveMessage', (message) => {
            setMessages((prev) => [...prev, message]);
            toast.info('Нове повідомлення!', { position: 'top-right' });
        });

        socket.on('error', (errMsg) => {
            toast.error(errMsg, { position: 'top-right' });
        });

        return () => {
            socket.off('receiveMessage');
            socket.off('error');
            socket.emit('leaveRoom', chatId);
        };
    }, [chatId, userId]);

    const handleSend = () => {
        if (newText.trim() === '') return;
        socket.emit('sendMessage', { chatId, senderId: userId, text: newText });
        setNewText('');
    };

    return (
        <div>
            <ToastContainer />

            <div
                style={{
                    border: '1px solid #ccc',
                    padding: '1rem',
                    height: '300px',
                    overflowY: 'scroll'
                }}>
                {messages.map((msg) => (
                    <div key={msg._id}>
                        <b>{msg.sender}: </b>
                        {msg.text}
                    </div>
                ))}
            </div>

            <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Введіть повідомлення..."
            />
            <button onClick={handleSend}>Надіслати</button>
        </div>
    );
};

export default ChatRoom;
