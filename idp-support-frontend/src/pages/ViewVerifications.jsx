import React, { useEffect, useState } from 'react';
import { Card, Button, Spin, Alert, Tag, Empty } from 'antd';
import dayjs from 'dayjs';
import { VerificationService } from '@services/VerificationService';
import { ValidationFlagsBlock } from '@components/ValidationFlagsBlock';
import { toast } from 'react-toastify';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { routes } from '@router/routes';
import { getVerificationStatusColor } from '@utils/index';
import { DatePicker, Input, Select } from 'antd';
import { verificationStatusMapper } from '@const/verificationStatus';

const { RangePicker } = DatePicker;

export const ViewVerifications = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState();
    const [userIdFilter, setUserIdFilter] = useState('');
    const [dateRange, setDateRange] = useState(null);

    const handleClearFilters = () => {
        setStatusFilter(undefined);
        setUserIdFilter('');
        setDateRange([]);
    };

    useEffect(() => {
        const fetchVerifications = async () => {
            try {
                const data = await VerificationService.getAllVerifications();
                setVerifications(data?.verifications);
            } catch (err) {
                setError(err.message || 'Failed to fetch verifications');
                toast('Виникла помилка при завантаженні верифікацій', { type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchVerifications();
    }, []);

    const navigate = useNavigate();

    if (loading) return <Spin tip="Завантаження..." />;
    if (error) return <Alert message="Помилка" description={error} type="error" />;

    const filteredVerifications = verifications.filter((item) => {
        const createdAt = dayjs(item.createdAt);

        const matchesUserId = userIdFilter
            ? item.user?._id?.toLowerCase().includes(userIdFilter.toLowerCase())
            : true;

        const matchesStatus = statusFilter ? item.status === statusFilter : true;

        const matchesDate =
            dateRange && dateRange.length === 2
                ? createdAt.isAfter(dateRange[0], 'day') && createdAt.isBefore(dateRange[1], 'day')
                : true;

        return matchesUserId && matchesStatus && matchesDate;
    });
    return (
        <div style={{ display: 'grid', gap: '16px' }}>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                <Input
                    placeholder="Пошук за User ID"
                    value={userIdFilter}
                    onChange={(e) => setUserIdFilter(e.target.value)}
                    style={{ minWidth: 220, flex: '1 1 250px' }}
                />

                <RangePicker
                    style={{ minWidth: 250, flex: '2 1 300px' }}
                    value={dateRange}
                    onChange={setDateRange}
                />

                <Select
                    placeholder="Статус"
                    allowClear
                    style={{ minWidth: 180, flex: '1 1 180px' }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { label: 'Очікує', value: 'Pending' },
                        { label: 'Підтверджено', value: 'Approved' },
                        { label: 'Відхилено', value: 'Rejected' }
                    ]}
                />

                <Button onClick={handleClearFilters}>Скинути</Button>
            </div>
            {filteredVerifications?.length > 0 ? (
                filteredVerifications.map((item) => (
                    <Card
                        key={item._id}
                        title={`${item.user?.firstName || 'Імʼя'} ${item.user?.lastName || ''}`}
                        extra={
                            <Button
                                type="primary"
                                icon={<InfoCircleOutlined />}
                                onClick={() => {
                                    navigate(
                                        `${routes.VIEW_VERIFICATION}`.replace(':id', item._id)
                                    );
                                }}>
                                Переглянути
                            </Button>
                        }>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr'
                            }}>
                            <div style={{ flex: '1 1 50%', minWidth: 200 }}>
                                <p>
                                    <strong>Email:</strong> {item.user?.email}
                                </p>
                                <p>
                                    <strong>User ID:</strong> {item.user?._id}
                                </p>
                            </div>
                            <div style={{ flex: '1 1 50%', minWidth: 200 }}>
                                <p>
                                    <strong>Дата створення:</strong>{' '}
                                    {dayjs(item.createdAt).format('DD.MM.YYYY HH:mm')}
                                </p>
                                <p>
                                    <strong>Статус:</strong>{' '}
                                    <Tag color={getVerificationStatusColor(item.status)}>
                                        {verificationStatusMapper[item.status]}
                                    </Tag>
                                </p>
                            </div>
                        </div>

                        <ValidationFlagsBlock
                            flags={item.validationFlags}
                            declineReason={item?.declineReason}
                        />
                    </Card>
                ))
            ) : (
                <Empty style={{ marginTop: '100px' }} description="Не знайдено верифікацій" />
            )}
        </div>
    );
};
