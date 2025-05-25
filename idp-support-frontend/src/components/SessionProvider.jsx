import { useState } from 'react';

import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { UserService } from '../services/UserService';
import { SessionLoading } from './SessionLoading';
import { useChatStore } from '@store/chatStore';

export const SessionProvider = ({ children }) => {
    const setUser = useUserStore((state) => state.setUser);
    const setSessionChecked = useUserStore((state) => state.setSessionChecked);
    const setUnreadCount = useChatStore((state) => state.setUnreadCount);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (window.location.pathname === '/login') {
            setSessionChecked(true);
            return;
        }

        const checkSession = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setSessionChecked(true);
                return (window.location.href = '/login');
            }

            setLoading(true);
            try {
                const { user } = await UserService.getSession();
                setUnreadCount(user?.unreadCount);
                setUser(user);
            } catch {
                localStorage.removeItem('token');
                window.location.href = '/login';
            } finally {
                setLoading(false);
                setSessionChecked(true);
            }
        };

        checkSession();
    }, []);

    if (loading) return <SessionLoading />;

    return children;
};
