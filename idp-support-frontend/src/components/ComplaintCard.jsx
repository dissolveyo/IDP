import { Card, Typography, Avatar, Rate, Tag, Divider, Button, Space, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { baseURL } from '@api/index';
import { ComplaintReasons } from '@const/complaintReasons';
import { Link } from 'react-router';
import { useState } from 'react';
import { ComplaintService } from '@services/ComplaintService';
import { toast } from 'react-toastify';
import { complaintStatusMapper } from '@const/complaintStatusMapper';

const { Text, Title, Paragraph } = Typography;

export const ComplaintCard = ({ complaint, refetch }) => {
    const { complainant, listing, rating, reason, title, description, createdAt } = complaint;
    const [loading, setLoading] = useState(false);

    const labelReason = ComplaintReasons[complaint?.type].find(
        ({ value }) => value === reason
    ).label;

    const updateComplaintStatus = (status) => {
        setLoading(true);

        ComplaintService.updateStatus(complaint?.id, status)
            .then(() => {
                toast('Скаргу успішно оновлено', { type: 'success' });
                refetch();
            })
            .catch(() => {
                toast('Виникла помилка при оновленні скраги', { type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    return (
        <Spin spinning={loading}>
            <Card
                title={
                    <Title level={4} style={{ color: '#262626', margin: 0 }}>
                        📝 Скарга: <Text strong>{title}</Text>
                    </Title>
                }
                style={{
                    marginBottom: 16,
                    backgroundColor: '#fafafa',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
                extra={
                    <Space size="middle">
                        <Tag
                            color={
                                complaint?.status === 'handled'
                                    ? 'green'
                                    : complaint?.status === 'dismissed'
                                    ? 'red'
                                    : 'orange'
                            }
                            style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {complaintStatusMapper[complaint?.status]}
                        </Tag>
                        <Button
                            onClick={() => updateComplaintStatus('handled')}
                            type="primary"
                            disabled={complaint?.status === 'handled'}>
                            Вирішено
                        </Button>
                        <Button
                            onClick={() => updateComplaintStatus('dismissed')}
                            danger
                            disabled={complaint?.status === 'dismissed'}>
                            Відхилено
                        </Button>
                    </Space>
                }>
                <div style={{ backgroundColor: '#fffbe6', padding: 16, borderRadius: 8 }}>
                    <Title level={5} style={{ color: '#faad14', marginBottom: 12 }}>
                        👤 Інформація про скаржника
                    </Title>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Avatar
                            src={!!complainant?.avatar && `${baseURL}${complainant?.avatar}`}
                            icon={!complainant?.avatar && <UserOutlined />}
                            size={56}
                            style={{ border: '1px solid #d9d9d9' }}
                        />
                        <div>
                            <Text strong style={{ fontSize: 16 }}>
                                {complainant?.firstName} {complainant?.lastName}
                            </Text>
                            <br />
                            <Text type="secondary">{complainant?.email}</Text>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                            <Text type="secondary">
                                📅 Дата скарги: {new Date(createdAt).toLocaleDateString()}
                            </Text>
                        </div>
                    </div>
                </div>

                <Divider />

                {listing && (
                    <>
                        <Link
                            to={`/listings/${listing._id}`}
                            style={{
                                textDecoration: 'none',
                                display: 'block',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}>
                            <div
                                style={{
                                    backgroundColor: '#e6f7ff',
                                    padding: 16,
                                    borderRadius: 8
                                }}>
                                <Title level={5} style={{ color: '#1890ff', marginBottom: 12 }}>
                                    📢 Інформація про оголошення
                                </Title>
                                <Text style={{ display: 'block', marginBottom: 8, color: '#000' }}>
                                    <strong>Назва:</strong> {listing.title}
                                </Text>
                                {listing.description && (
                                    <Paragraph
                                        type="secondary"
                                        style={{ marginTop: 0, color: '#595959' }}>
                                        <strong>Опис:</strong> {listing.description}
                                    </Paragraph>
                                )}
                            </div>
                        </Link>
                        <Divider />
                    </>
                )}

                {complaint?.chat && (
                    <>
                        <Link
                            to={`/chats/${complaint?.chat.id}`}
                            style={{
                                textDecoration: 'none',
                                display: 'block',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}>
                            <div
                                style={{
                                    backgroundColor: '#e6f7ff',
                                    padding: 16,
                                    borderRadius: 8
                                }}>
                                <Title level={5} style={{ color: '#1890ff', marginBottom: 12 }}>
                                    📢 Інформація про чат
                                </Title>
                                <Text style={{ display: 'block', marginBottom: 8, color: '#000' }}>
                                    <strong>ID чату:</strong> {complaint?.chat.id}
                                </Text>
                            </div>
                        </Link>
                        <Divider />
                    </>
                )}

                {rating && (
                    <>
                        <Link
                            to={`/listings/${listing.id}#comment-${rating.id}`}
                            style={{
                                textDecoration: 'none',
                                display: 'block',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}>
                            <div
                                style={{
                                    backgroundColor: '#f6ffed',
                                    padding: 16,
                                    borderRadius: 8,
                                    cursor: 'pointer'
                                }}>
                                <Title level={5} style={{ color: '#389e0d', marginBottom: 12 }}>
                                    💬 Інформація про коментар
                                </Title>
                                <Rate
                                    disabled
                                    value={rating.score}
                                    allowHalf
                                    style={{ fontSize: 24, marginBottom: 8, color: '#52c41a' }}
                                />
                                <Paragraph style={{ marginTop: 0, color: '#595959' }}>
                                    {rating.comment}
                                </Paragraph>
                            </div>
                        </Link>
                        <Divider />
                    </>
                )}

                <div style={{ backgroundColor: '#fff2f0', padding: 16, borderRadius: 8 }}>
                    <Title level={5} style={{ marginBottom: 8, color: '#a8071a' }}>
                        🛑 Деталі скарги
                    </Title>
                    <Text strong style={{ color: '#cf1322' }}>
                        Причина:
                    </Text>
                    <Tag color="red" style={{ marginLeft: 8 }}>
                        {labelReason}
                    </Tag>
                    <Paragraph style={{ marginTop: 12, color: '#595959' }}>
                        <Text strong>Опис скарги:</Text>
                        <br />
                        {description}
                    </Paragraph>
                </div>
            </Card>
        </Spin>
    );
};
