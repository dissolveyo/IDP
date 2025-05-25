import { Form, Input, Button, Tabs, Card, Spin, Radio, Image, Typography } from 'antd';
import { UserService } from '../services/UserService';
import { toast } from 'react-toastify';
import { useToggle } from '@uidotdev/usehooks';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/userStore';
import { routes } from '../router/routes';
import { useState } from 'react';
import { useChatStore } from '@store/chatStore';

const { Title, Text } = Typography;

export const LoginPage = () => {
    const [loginForm] = Form.useForm();
    const [registerForm] = Form.useForm();
    const [loading, toggleLoading] = useToggle(false);
    const [activeKey, setActiveKey] = useState('login');
    const setUnreadCount = useChatStore((state) => state.setUnreadCount);
    const navigate = useNavigate();

    const handleLogin = () => {
        loginForm.validateFields().then(async (values) => {
            toggleLoading();
            try {
                const { token, user } = await UserService.login(values);
                useUserStore.getState().setUser({ token, ...user });
                localStorage.setItem('token', token);
                setUnreadCount(user?.unreadCount);
                navigate(routes.HOME);
            } catch (e) {
                console.error('Caught login error:', e);
                toast(e.message || 'Login failed', { type: 'error' });
            } finally {
                toggleLoading();
            }
        });
    };

    const handleRegister = () => {
        registerForm.validateFields().then((values) => {
            toggleLoading();
            UserService.register(values)
                .then(() => {
                    toast('Ви були успішно зареєстровані. Тепер можете залогінитись', {
                        type: 'success'
                    });
                    registerForm.resetFields();
                    setActiveKey('login');
                })
                .catch((e) => {
                    toast(e.message, { type: 'error' });
                })
                .finally(toggleLoading);
        });
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f0f4ff 0%, #d6e4ff 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 16px'
            }}>
            <Spin spinning={loading}>
                <Card
                    style={{
                        width: 420,
                        borderRadius: 12,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
                    }}
                    bodyStyle={{ padding: 30 }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Image
                            width={64}
                            preview={false}
                            src="https://cdn-icons-png.flaticon.com/512/295/295128.png"
                            alt="logo"
                        />
                        <Title level={3} style={{ marginTop: 12 }}>
                            Вітаємо!
                        </Title>
                        <Text type="secondary">Увійдіть або зареєструйтесь нижче</Text>
                    </div>

                    <Tabs
                        activeKey={activeKey}
                        onChange={(key) => setActiveKey(key)}
                        items={[
                            {
                                key: 'login',
                                label: 'Вхід',
                                children: (
                                    <Form form={loginForm} layout="vertical">
                                        <Form.Item
                                            label="Електронна пошта"
                                            name="email"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Введіть електронну пошту'
                                                },
                                                {
                                                    type: 'email',
                                                    message: 'Невірний формат електронної пошти'
                                                }
                                            ]}>
                                            <Input placeholder="example@email.com" />
                                        </Form.Item>

                                        <Form.Item
                                            label="Пароль"
                                            name="password"
                                            rules={[{ required: true, message: 'Введіть пароль' }]}>
                                            <Input.Password placeholder="••••••••" />
                                        </Form.Item>

                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                onClick={() => handleLogin()}
                                                block>
                                                Увійти
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                )
                            },
                            {
                                key: 'register',
                                label: 'Реєстрація',
                                children: (
                                    <Form
                                        initialValues={{ role: 'IDP' }}
                                        form={registerForm}
                                        layout="vertical">
                                        <Form.Item
                                            label="Роль"
                                            name="role"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Будь ласка, оберіть роль'
                                                }
                                            ]}>
                                            <Radio.Group
                                                buttonStyle="solid"
                                                style={{ width: '100%' }}>
                                                <Radio.Button
                                                    style={{ width: '50%', textAlign: 'center' }}
                                                    value="IDP">
                                                    ВПО
                                                </Radio.Button>
                                                <Radio.Button
                                                    style={{ width: '50%', textAlign: 'center' }}
                                                    value="Landlord">
                                                    Орендодавець
                                                </Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>

                                        <Form.Item
                                            label="Ім'я"
                                            name="firstName"
                                            rules={[{ required: true, message: "Введіть ім'я" }]}>
                                            <Input />
                                        </Form.Item>

                                        <Form.Item
                                            label="Прізвище"
                                            name="lastName"
                                            rules={[
                                                { required: true, message: 'Введіть прізвище' }
                                            ]}>
                                            <Input />
                                        </Form.Item>

                                        <Form.Item
                                            label="Електронна пошта"
                                            name="email"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Введіть електронну пошту'
                                                },
                                                {
                                                    type: 'email',
                                                    message: 'Невірний формат електронної пошти'
                                                }
                                            ]}>
                                            <Input />
                                        </Form.Item>

                                        <Form.Item
                                            label="Пароль"
                                            name="password"
                                            rules={[{ required: true, message: 'Введіть пароль' }]}>
                                            <Input.Password />
                                        </Form.Item>

                                        <Form.Item>
                                            <Button
                                                onClick={() => handleRegister()}
                                                type="primary"
                                                block>
                                                Зареєструватися
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                )
                            }
                        ]}
                    />
                </Card>
            </Spin>
        </div>
    );
};
