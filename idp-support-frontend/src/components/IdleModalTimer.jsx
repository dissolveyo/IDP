import React, { useState, useRef } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { Modal, Typography, Progress } from 'antd';
import { useUserStore } from '@store/userStore';

const { Title, Text } = Typography;

const TOTAL_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const PROMPT_BEFORE_IDLE = 2 * 60 * 1000; // 2 minutes

export const IdleModalTimer = () => {
    const [open, setOpen] = useState(false);

    const [remaining, setRemaining] = useState(PROMPT_BEFORE_IDLE);
    const intervalRef = useRef(null);
    const clearUser = useUserStore((state) => state.clearUser);
    const user = useUserStore((state) => state.user);

    const startCountdown = () => {
        setRemaining(PROMPT_BEFORE_IDLE);

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1000) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setOpen(false);

                    clearUser();
                    localStorage.removeItem('token');
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);
    };

    const onPrompt = () => {
        if (!user) return;
        setOpen(true);
        startCountdown();
    };

    const onIdle = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setOpen(false);
    };

    const idleTimer = useIdleTimer({
        timeout: TOTAL_TIMEOUT,
        promptBeforeIdle: PROMPT_BEFORE_IDLE,
        disabled: !user,
        onPrompt,
        onIdle,
        debounce: 500,
        events: [
            'mousemove',
            'keydown',
            'wheel',
            'mousedown',
            'touchstart',
            'touchmove',
            'visibilitychange'
        ],
        startOnMount: true,
        stopOnIdle: false
    });

    const handleUserActivity = () => {
        if (!user) return;
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setOpen(false);
        setRemaining(PROMPT_BEFORE_IDLE);
        idleTimer.reset();
    };

    const minutes = Math.floor((remaining / 1000 / 60) % 60)
        .toString()
        .padStart(2, '0');
    const seconds = Math.floor((remaining / 1000) % 60)
        .toString()
        .padStart(2, '0');

    const percent = ((PROMPT_BEFORE_IDLE - remaining) / PROMPT_BEFORE_IDLE) * 100;

    return (
        <Modal open={open} footer={null} closable={false} maskClosable={false} centered>
            <div style={{ textAlign: 'center', padding: 24 }}>
                <Title level={4}>Сесія завершиться через:</Title>
                <Title>
                    {minutes}:{seconds}
                </Title>
                <Progress
                    percent={percent}
                    status="active"
                    strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#f5222d'
                    }}
                    showInfo={false}
                />
                <Text type="secondary">
                    Будь ласка, оновіть активність, щоб залишитися в системі
                </Text>
                <div style={{ marginTop: 20 }}>
                    <a onClick={handleUserActivity}>Продовжити сесію</a>
                </div>
            </div>
        </Modal>
    );
};
