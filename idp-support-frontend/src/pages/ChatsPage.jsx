import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Badge, Avatar, List, Typography, Input, Layout, Spin, Empty } from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import ChatWindow from '@components/ChatWindow';
import { useUserStore } from '@store/userStore';
import { ChatService } from '@services/ChatService';
import { toast } from 'react-toastify';
import { baseURL } from '@api/index';
import { socket } from '../socket';
import { useChatStore } from '@store/chatStore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { Sider, Content } = Layout;

export const ChatsPage = () => {
    const { id: selectedChatId } = useParams();
    const user = useUserStore((state) => state?.user);
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const readByCount = useChatStore((state) => state.readByCount);

    const handleChatClick = (chatId) => {
        navigate(`/chats/${chatId}`);
    };

    const getChats = () => {
        setLoading(true);

        ChatService.getChats()
            .then((res) => {
                setChats(res.data);
            })
            .catch(() => {
                toast('Виникла помилка при отриманні чатів', { type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    const getModeratorRequestedChats = () => {
        setLoading(true);

        ChatService.getModeratorRequestedChats()
            .then((res) => {
                setChats(res.data);
            })
            .catch(() => {
                toast('Виникла помилка при отриманні чатів', { type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (user?.role === 'Moderator') {
            getModeratorRequestedChats();
            return;
        }
        getChats();
    }, []);

    useEffect(() => {
        if (!selectedChatId || !user?._id) return;

        const selectedChat = chats.find((chat) => chat.id === selectedChatId);
        const unread = selectedChat?.unread || 0;

        if (unread > 0) {
            readByCount(unread);
        }
        socket.emit('markAsRead', { chatId: selectedChatId, userId: user._id });

        setChats((prevChats) =>
            prevChats.map((chat) => (chat.id === selectedChatId ? { ...chat, unread: 0 } : chat))
        );
    }, [selectedChatId, user?._id]);

    const handleNewMessage = (newMessage) => {
        setChats((prevChats) => {
            return prevChats.map((chat) => {
                if (chat.id === newMessage.chatId) {
                    const updatedChat = {
                        ...chat,
                        lastMessage: newMessage.content,
                        timestamp: newMessage.timestamp
                    };

                    if (newMessage.chatId !== selectedChatId) {
                        updatedChat.unread = (chat.unread || 0) + 1;
                    } else {
                        updatedChat.unread = 0;
                    }

                    return updatedChat;
                }
                return chat;
            });
        });
    };

    const handleSuccess = () => {
        getModeratorRequestedChats();
        navigate(`/chats/`);
    };

    useEffect(() => {
        socket.on('receiveMessage', handleNewMessage);

        return () => {
            socket.off('receiveMessage', handleNewMessage);
        };
    }, [selectedChatId]);

    const chatList = (
        <Spin spinning={loading}>
            <div
                style={{
                    padding: 24,
                    background: '#fff',
                    borderRight: '1px solid #f0f0f0',
                    height: '70vh'
                }}>
                <Title level={3}>Ваші чати</Title>
                <Search
                    placeholder="Пошук по чатах"
                    style={{ marginBottom: 20, maxWidth: 400 }}
                    allowClear
                />
                <List
                    itemLayout="horizontal"
                    dataSource={chats}
                    locale={{
                        emptyText: (
                            <Empty style={{ margin: '0' }} description="Немає доступних чатів" />
                        )
                    }}
                    renderItem={(chat) => (
                        <List.Item onClick={() => handleChatClick(chat.id)}>
                            <List.Item.Meta
                                avatar={
                                    <Badge count={chat.unread}>
                                        <Avatar
                                            src={chat?.avatar && `${baseURL}${chat?.avatar}`}
                                            icon={!chat?.avatar && <UserOutlined />}
                                        />
                                    </Badge>
                                }
                                title={
                                    <>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                            }}>
                                            <span>{chat.name}</span>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {dayjs(chat.timestamp).format(
                                                    'YYYY-MM-DD HH:mm:ss'
                                                )}
                                            </Text>
                                        </div>
                                        {chat.listing && (
                                            <div style={{ marginTop: 4 }}>
                                                <div style={{ fontWeight: 600 }}>
                                                    {chat.listing.title}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                }
                                description={
                                    <div>
                                        <Text
                                            type={chat.unread ? 'warning' : 'secondary'}
                                            strong={!!chat.unread}>
                                            {chat.lastMessage}
                                        </Text>
                                    </div>
                                }
                            />
                            <MessageOutlined style={{ fontSize: '16px', color: '#999' }} />
                        </List.Item>
                    )}
                />
            </div>
        </Spin>
    );

    if (selectedChatId) {
        return (
            <Layout style={{ height: '100vh' }}>
                <Sider width={350} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
                    {chatList}
                </Sider>
                <Layout>
                    <Content>
                        {
                            <ChatWindow
                                onSuccess={handleSuccess}
                                chat={chats.find((chat) => chat.id === selectedChatId)}
                                chatId={selectedChatId}
                                onNewMessage={handleNewMessage}
                                currentUserId={user?._id}
                            />
                        }
                    </Content>
                </Layout>
            </Layout>
        );
    }

    return chatList;
};
