import { Form, Input, Button, Card, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { useToggle } from '@uidotdev/usehooks';
import { UserService } from '@services/UserService';
import { routes } from '@router/routes';

const { Title } = Typography;

export const ActivatePassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, toggleLoading] = useToggle(false);

    const onFinish = async (values) => {
        if (values.password !== values.confirm) {
            return toast('Паролі не співпадають', { type: 'error' });
        }

        toggleLoading();
        UserService.activatePassword({ password: values.password, token })
            .then(() => {
                toast('Пароль успішно встановлено', { type: 'success' });
                navigate(routes.LOGIN);
            })
            .catch((e) => {
                toast(e.message || 'Виникла помилка при встановленні пароля. Спробуйте ще раз', {
                    type: 'error'
                });
            })
            .finally(toggleLoading);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #f0f4ff 0%, #d6e4ff 100%)',
                padding: 24
            }}>
            <Card style={{ maxWidth: 420, width: '100%', padding: 24, borderRadius: 12 }}>
                <Title level={3} style={{ marginBottom: 24 }}>
                    Встановлення пароля
                </Title>

                <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
                    <Form.Item
                        label="Новий пароль"
                        name="password"
                        rules={[{ required: true, message: 'Введіть новий пароль' }]}>
                        <Input.Password placeholder="Новий пароль" />
                    </Form.Item>

                    <Form.Item
                        label="Підтвердіть пароль"
                        name="confirm"
                        rules={[{ required: true, message: 'Підтвердіть пароль' }]}>
                        <Input.Password placeholder="Підтвердіть пароль" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Встановити пароль
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};
