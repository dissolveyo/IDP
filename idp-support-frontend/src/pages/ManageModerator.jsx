import { Form, Input, Button, Card, Typography, Row, Col, Divider } from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router';
import { routes } from '@router/routes';
import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
import { UserService } from '@services/UserService';
import { toast } from 'react-toastify';
import { useToggle } from '@uidotdev/usehooks';
import { userStatusMapper } from '@const/userStatus';

const { Title } = Typography;

export const ManageModerator = () => {
    const { id } = useParams();
    const editMode = !!id;
    const navigate = useNavigate();

    const [form] = Form.useForm();
    const [loading, toggleLoading] = useToggle(false);
    const [resendLoading, toggleResendLoading] = useToggle(false);
    const [moderator, setModerator] = useState(null);

    useEffect(() => {
        if (!editMode) return;

        const getModeratorById = () => {
            toggleLoading();
            UserService.getModeratorById(id)
                .then((moderator) => {
                    setModerator(moderator);
                    form.setFieldsValue(moderator);
                })
                .catch((e) => {
                    if (!e?.message) return;
                    toast(e?.message, { type: 'error' });
                })
                .finally(toggleLoading);
        };

        getModeratorById();
    }, [id]);

    const handleCreateModerator = (values) => {
        toggleLoading();

        UserService.createModerator({ ...values })
            .then((moderator) => {
                toast('Модератора було успішно створено', { type: 'success' });
                navigate(routes.MANAGE_MODERATOR.replace(':id', moderator?._id));
            })
            .catch((e) => {
                toast(e?.message || 'Виникла помилка при створенні модератора', { type: 'error' });
            })
            .finally(toggleLoading);
    };

    const handleUpdateModerator = (values) => {
        toggleLoading();

        UserService.updateModeratorBySuperUser(id, {
            firstName: values?.firstName,
            lastName: values?.lastName
        })
            .then((moderator) => {
                toast('Модератора було успішно оновлено', { type: 'success' });
                setModerator(moderator);
                form.setFieldsValue(moderator);
            })
            .catch((e) => {
                toast(e?.message || 'Виникла помилка при оновленні модератора', { type: 'error' });
            })
            .finally(toggleLoading);
    };

    const handleFinish = (values) => {
        if (editMode) {
            handleUpdateModerator(values);
            return;
        }

        handleCreateModerator(values);
    };

    const handleResendLink = () => {
        toggleResendLoading();
        UserService.resendActivatePasswordLink(id)
            .then(() => {
                toast('Посилання було успішно відправлене', { type: 'success' });
            })
            .catch(() => {
                toast('Винилка помилка при надсиланні посилання', { type: 'error' });
            })
            .finally(toggleResendLoading);
    };

    const isDeleted = moderator?.status === 'Deleted';

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined style={{ fontSize: '20px' }} />}
                    onClick={() => navigate(routes.MANAGE_MODERATORS)}
                />
                <Title level={3} style={{ margin: 0 }}>
                    Модератори
                </Title>
            </div>
            <Card>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    <Title level={4}>
                        {editMode ? 'Редагуйте існуючого модератора' : 'Створіть нового модератора'}
                    </Title>

                    {editMode && moderator?.status === 'Unverified' && (
                        <Button
                            loading={resendLoading}
                            icon={<MailOutlined />}
                            type="default"
                            onClick={handleResendLink}>
                            Надіслати лінк активації
                        </Button>
                    )}
                </div>

                <Divider />

                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleFinish}
                    style={{ marginTop: 24 }}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="firstName"
                                label="Імʼя"
                                rules={[{ required: true, message: 'Введіть імʼя' }]}>
                                <Input disabled={isDeleted} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="lastName"
                                label="Прізвище"
                                rules={[{ required: true, message: 'Введіть прізвище' }]}>
                                <Input disabled={isDeleted} />
                            </Form.Item>
                        </Col>

                        {editMode && moderator && (
                            <Col span={12}>
                                <Form.Item label="Статус">
                                    <Input
                                        disabled
                                        value={userStatusMapper[moderator.status]}
                                        style={{
                                            background:
                                                moderator.status === 'Active'
                                                    ? '#d9f7be'
                                                    : moderator.status === 'Unverified'
                                                    ? '#fff3cd'
                                                    : moderator.status === 'Suspended'
                                                    ? '#fff1f0'
                                                    : moderator.status === 'Deleted'
                                                    ? '#f0f0f0'
                                                    : '#f5f5f5',
                                            border: `1px solid ${
                                                moderator.status === 'Active'
                                                    ? '#52c41a'
                                                    : moderator.status === 'Unverified'
                                                    ? '#faad14'
                                                    : moderator.status === 'Suspended'
                                                    ? '#f5222d'
                                                    : moderator.status === 'Deleted'
                                                    ? '#8c8c8c'
                                                    : '#d9d9d9'
                                            }`,
                                            color: '#000',
                                            fontWeight: 500
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        )}

                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Введіть email' },
                                    {
                                        type: 'email',
                                        message: 'Невірний формат електронної пошти'
                                    }
                                ]}>
                                <Input disabled={editMode} />
                            </Form.Item>
                        </Col>

                        {editMode && moderator && (
                            <>
                                <Col span={12}>
                                    <Form.Item label="Створено">
                                        <Input
                                            disabled
                                            value={dayjs(moderator.createdAt).format(
                                                'DD.MM.YYYY HH:mm'
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Оновлено">
                                        <Input
                                            disabled
                                            value={dayjs(moderator.updatedAt).format(
                                                'DD.MM.YYYY HH:mm'
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                            </>
                        )}
                    </Row>

                    {!isDeleted && (
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editMode ? 'Зберегти зміни' : 'Створити'}
                            </Button>
                        </Form.Item>
                    )}
                </Form>
            </Card>
        </div>
    );
};
