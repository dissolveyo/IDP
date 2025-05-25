import { Form, Input, Button, Typography, Upload, Avatar, Divider, Spin } from 'antd';
import {
    UserOutlined,
    UploadOutlined,
    MailOutlined,
    SecurityScanOutlined
} from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import dayjs from 'dayjs';
import { UserService } from '@services/UserService';
import { useToggle } from '@uidotdev/usehooks';
import { toast } from 'react-toastify';
import { VerificationStatus } from '@const/verificationStatus';
import { useNavigate } from 'react-router';
import { routes } from '@router/routes';
import { useEffect, useState } from 'react';
import { ROLES, userRoleMapper } from '@const/roles';
import { VerificationService } from '@services/VerificationService';

const { Title, Text } = Typography;

const verificationStatusStyles = {
    [VerificationStatus.APPROVED]: {
        background: '#d9f7be',
        border: '1px solid #52c41a'
    },
    [VerificationStatus.PENDING]: {
        background: '#fff3cd',
        border: '1px solid #faad14'
    },
    [VerificationStatus.REJECTED]: {
        background: '#fff1f0',
        border: '1px solid #f5222d'
    },
    default: {
        background: '#f5f5f5',
        border: '1px solid #d9d9d9'
    }
};

export const EditProfile = () => {
    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const [loading, toggleLoading] = useToggle();
    const [verificationsLoading, toggleVerificationsLoading] = useToggle();
    const navigate = useNavigate();
    const [verifications, setVerifications] = useState([]);

    const [form] = Form.useForm();

    const handleSave = async (values) => {
        toggleLoading();

        const { firstName, lastName } = values;

        UserService.updateProfile({ firstName, lastName })
            .then((res) => {
                setUser(res);
            })
            .catch(() => {
                toast('Виникла помилка при оновленні данних', { type: 'error' });
            })
            .finally(toggleLoading);
    };

    useEffect(() => {
        if (user?.role !== ROLES.IDP) return;

        const getPersonalVerifications = () => {
            toggleVerificationsLoading();
            VerificationService.getPersonalVerifications()
                .then(({ verifications }) => {
                    setVerifications(verifications);
                })
                .catch(() => {
                    toast('Виникла помилка при запиті ваших верифікацій', { type: 'error' });
                })
                .finally(toggleVerificationsLoading);
        };

        getPersonalVerifications();
    }, []);

    const hasPendingVerification =
        !verifications.some((v) => v.status === 'Pending') && !user?.isDocumentsVerified;

    return (
        <Spin spinning={loading}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column'
                }}>
                <div
                    style={{
                        maxWidth: 1000,
                        width: '100%',
                        display: 'flex',
                        gap: 32,
                        background: '#fff',
                        borderRadius: 16,
                        padding: 32,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
                    }}>
                    <div style={{ width: 280, flexShrink: 0 }}>
                        <div
                            style={{
                                textAlign: 'center',
                                marginBottom: 24,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                            <Avatar
                                shape="square"
                                size={128}
                                src={
                                    !!user?.avatar &&
                                    `${import.meta.env.VITE_API_URL}${user?.avatar}?t=${Date.now()}`
                                }
                                icon={!user?.avatar && <UserOutlined />}
                                style={{ marginBottom: 16 }}
                            />
                            <Upload
                                name="avatar"
                                action={`${import.meta.env.VITE_API_URL}/api/users/avatar`}
                                headers={{
                                    Authorization: `Bearer ${localStorage.getItem('token')}`
                                }}
                                showUploadList={false}
                                accept="image/png,image/jpeg"
                                beforeUpload={(file) => {
                                    if (file.size / 1024 > 500) {
                                        toast('Розмір файлу не повинен перевищувати 500KB', {
                                            type: 'error'
                                        });
                                    }

                                    return file.size / 1024 < 500;
                                }}
                                onChange={(info) => {
                                    if (info.file.status === 'done') {
                                        const updatedUser = info.file.response.user;
                                        setUser(updatedUser);
                                    } else if (info.file.status === 'error') {
                                        toast('Виникла помилка під час завантаження файлу', {
                                            type: 'error'
                                        });
                                    }
                                }}>
                                <Button icon={<UploadOutlined />}>Змінити аватар</Button>
                            </Upload>
                        </div>

                        <Divider />

                        <div style={{ paddingLeft: 8 }}>
                            <Text type="secondary">Роль:</Text>
                            <div>{userRoleMapper[user?.role]}</div>

                            {user?.role === 'IDP' && (
                                <div
                                    style={{
                                        marginTop: 16,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                    <Text type="secondary">Статус верифікації:</Text>
                                    {typeof user.isDocumentsVerified === 'boolean' && (
                                        <div>
                                            {user.isDocumentsVerified
                                                ? 'Верифікований'
                                                : 'Неверифікований'}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ marginTop: 16 }}>
                                <Text type="secondary">На сайті з:</Text>
                                <div>
                                    {user?.createdAt
                                        ? dayjs(user.createdAt).format('DD.MM.YYYY')
                                        : '—'}
                                </div>
                            </div>

                            <div style={{ marginTop: 16 }}>
                                <Text type="secondary">Останнє оновлення:</Text>
                                <div>
                                    {user?.updatedAt
                                        ? dayjs(user.updatedAt).format('DD.MM.YYYY')
                                        : '—'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <Title level={3} style={{ marginBottom: 24 }}>
                            Редагування профілю
                        </Title>

                        <Form
                            layout="vertical"
                            form={form}
                            requiredMark={false}
                            initialValues={{
                                firstName: user?.firstName,
                                lastName: user?.lastName,
                                email: user?.email
                            }}
                            onFinish={handleSave}>
                            <Form.Item
                                label="Ім'я"
                                name="firstName"
                                rules={[{ required: true, message: 'Введіть імʼя' }]}>
                                <Input placeholder="Імʼя" />
                            </Form.Item>

                            <Form.Item
                                label="Прізвище"
                                name="lastName"
                                rules={[{ required: true, message: 'Введіть прізвище' }]}>
                                <Input placeholder="Прізвище" />
                            </Form.Item>

                            <Form.Item label="Email" name="email">
                                <Input disabled prefix={<MailOutlined />} placeholder="Email" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Зберегти зміни
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>

                {user?.role === 'IDP' && (
                    <div
                        style={{
                            maxWidth: 1000,
                            width: '100%',
                            marginTop: 32,
                            background: '#fff',
                            borderRadius: 16,
                            padding: 32,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 16
                            }}>
                            <Title level={4}>Історія верифікацій статусу ВПО</Title>

                            {hasPendingVerification && (
                                <Button
                                    size="small"
                                    icon={<SecurityScanOutlined />}
                                    type="primary"
                                    onClick={() => navigate(routes.CREATE_VERIFICATION)}>
                                    Надіслати запит
                                </Button>
                            )}
                        </div>

                        <Spin spinning={verificationsLoading}>
                            {verifications.length > 0 ? (
                                verifications.map((entry, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr 1fr',
                                            padding: '12px 0',
                                            borderBottom:
                                                index !== verifications.length - 1
                                                    ? '1px solid #f0f0f0'
                                                    : 'none',
                                            gap: 16,
                                            rowGap: 4,
                                            alignItems: 'center'
                                        }}>
                                        <div>
                                            <Text type="secondary">Дата подачі:</Text>
                                            <div>{dayjs(entry.createdAt).format('DD.MM.YYYY')}</div>
                                        </div>

                                        <div style={{ textAlign: 'center' }}>
                                            <Text type="secondary">Статус:</Text>
                                            <div
                                                style={{
                                                    ...verificationStatusStyles[entry.status],
                                                    borderRadius: 6,
                                                    padding: '4px 8px',
                                                    fontWeight: 500,
                                                    width: '100px',
                                                    margin: '0 auto'
                                                }}>
                                                {entry.status === 'Approved'
                                                    ? 'Схвалено'
                                                    : entry.status === 'Rejected'
                                                    ? 'Відхилено'
                                                    : 'Очікує'}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <Text type="secondary">Дата розгляду:</Text>
                                            <div>
                                                {entry.reviewedAt
                                                    ? dayjs(entry.reviewedAt).format('DD.MM.YYYY')
                                                    : '—'}
                                            </div>
                                        </div>

                                        {entry.status === 'Rejected' && entry.declineReason && (
                                            <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                                                <Text type="secondary">Причина відхилення:</Text>
                                                <div>{entry.declineReason}</div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div
                                    style={{
                                        padding: '16px',
                                        borderRadius: 8,
                                        backgroundColor: '#fafafa',
                                        textAlign: 'center',
                                        color: '#8c8c8c'
                                    }}>
                                    Ви не зробили жодного запиту на верифікацію
                                </div>
                            )}
                        </Spin>
                    </div>
                )}
            </div>
        </Spin>
    );
};
