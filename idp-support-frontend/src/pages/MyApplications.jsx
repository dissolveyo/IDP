import React, { useEffect, useState } from 'react';
import {
    Card,
    DatePicker,
    Spin,
    Row,
    Col,
    Tag,
    Empty,
    Avatar,
    Select,
    Carousel,
    Button,
    Modal
} from 'antd';
import dayjs from 'dayjs';
import { ApplicationService } from '@services/ApplicationService';
import { baseURL } from '@api/index';
import { UserOutlined } from '@ant-design/icons';
import { periodMapper } from '@const/periodMapper';
import { getListingStatusColor } from '@utils/index';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import { useUserStore } from '@store/userStore';
import { ConfigProvider } from 'antd';
import ukUA from 'antd/es/locale/uk_UA';
import Title from 'antd/es/typography/Title';
import { ListingStatusMapper } from '@const/listingStatusMapper';

const { RangePicker } = DatePicker;

const { Option } = Select;

export const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([]);
    const user = useUserStore((state) => state.user);

    const [statusFilter, setStatusFilter] = useState();
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [mapCoords, setMapCoords] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const applyFilters = (apps = applications, date = dateRange, status = statusFilter) => {
        let result = [...apps];

        if (date && date[0] && date[1]) {
            const [start, end] = date;
            result = result.filter((app) => {
                const createdAt = dayjs(app.createdAt);
                return (
                    createdAt.isAfter(start.startOf('day')) && createdAt.isBefore(end.endOf('day'))
                );
            });
        }

        if (status) {
            result = result.filter((app) => app.status === status);
        }

        setFiltered(result);
    };

    const onStatusChange = (value) => {
        setStatusFilter(value);
        applyFilters(applications, dateRange, value);
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await ApplicationService.getUserApplications();

            setApplications(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error('Помилка при отриманні заявок:', err);
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (range) => {
        setDateRange(range);
        applyFilters(applications, range, statusFilter);
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'approved':
                return <Tag color="green">Схвалено</Tag>;
            case 'rejected':
                return <Tag color="red">Відхилено</Tag>;
            default:
                return <Tag color="blue">Очікує</Tag>;
        }
    };

    const showMap = (coords) => {
        setMapCoords(coords);
        setIsMapVisible(true);
    };

    const closeMap = () => {
        setIsMapVisible(false);
        setMapCoords(null);
    };

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
    });

    const changeApplicationStatus = (id, status) => {
        setLoading(true);
        ApplicationService.changeApplicationStatus(id, status)
            .then(() => {
                toast(
                    status === 'approved'
                        ? 'Ви успішно підтвердили заявку. Радимо деактивувати оголошення на час проживання'
                        : 'Ви успішно відхилили заявку. ',
                    { type: 'success' }
                );
                fetchApplications();
            })
            .catch(() => {
                toast('Виникла помилка під час оновлення заявки.', { type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    return (
        <div>
            <Title style={{ marginBottom: '24px' }} level={3}>
                Мої заявки
            </Title>

            <div
                style={{
                    marginBottom: 24,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    background: '#ffffff',
                    padding: '16px',
                    borderRadius: '8px'
                }}>
                <div>
                    <span style={{ marginRight: 8 }}>Фільтрувати за датою:</span>
                    <ConfigProvider locale={ukUA}>
                        <RangePicker
                            //@ts-ignore
                            value={dateRange}
                            onChange={onDateChange}
                            format="DD.MM.YYYY"
                            allowClear
                        />
                    </ConfigProvider>
                </div>
                <div>
                    <span style={{ marginRight: 8 }}>Статус заявки:</span>
                    <Select
                        value={statusFilter}
                        onChange={onStatusChange}
                        allowClear
                        style={{ width: 180 }}
                        placeholder="Виберіть статус">
                        <Option value="pending">Очікує</Option>
                        <Option value="approved">Схвалено</Option>
                        <Option value="rejected">Відхилено</Option>
                    </Select>
                </div>
            </div>

            {loading ? (
                <Spin size="large" />
            ) : filtered.length === 0 ? (
                <Empty
                    style={{ marginTop: '100px' }}
                    description="Немає заявок за обраний період"
                />
            ) : (
                <Row gutter={[16, 16]}>
                    {filtered.map((app) => (
                        <Col xs={24} sm={12} md={24} key={app._id}>
                            <Card
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span>{app.listingId?.title || 'Оголошення'}</span>
                                        {getStatusTag(app.status)}
                                    </div>
                                }
                                extra={
                                    app.status === 'pending' &&
                                    user?.role === 'Landlord' && (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={() =>
                                                    changeApplicationStatus(app._id, 'approved')
                                                }
                                                disabled={app.status === 'approved'}>
                                                Схвалити
                                            </Button>
                                            <Button
                                                danger
                                                size="small"
                                                onClick={() =>
                                                    changeApplicationStatus(app._id, 'rejected')
                                                }
                                                disabled={app.status === 'rejected'}>
                                                Відхилити
                                            </Button>
                                        </div>
                                    )
                                }>
                                <p>
                                    <strong>Адреса:</strong> {app.listingId?.address}
                                </p>
                                {app.message && (
                                    <p>
                                        <strong>Повідомлення:</strong> {app.message}
                                    </p>
                                )}
                                <p>
                                    <strong>Дата подачі:</strong>{' '}
                                    {dayjs(app.createdAt).format('DD.MM.YYYY HH:mm')}
                                </p>

                                <div
                                    style={{
                                        marginTop: '16px',
                                        borderTop: '1px solid #eee',
                                        paddingTop: '12px'
                                    }}>
                                    <p>
                                        <strong>Заявник:</strong>
                                    </p>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                        <Avatar
                                            icon={!app.applicantId?.avatar && <UserOutlined />}
                                            src={
                                                app.applicantId?.avatar &&
                                                `${baseURL}${app.applicantId?.avatar}`
                                            }
                                            alt="avatar"
                                            size={32}
                                        />
                                        <div>
                                            <div>
                                                {app.applicantId?.firstName}{' '}
                                                {app.applicantId?.lastName}
                                            </div>
                                            <div style={{ color: '#888' }}>
                                                {app.applicantId?.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        marginTop: '16px',
                                        borderTop: '1px solid #eee',
                                        paddingTop: '12px'
                                    }}>
                                    <p>
                                        <strong>Оголошення:</strong>
                                    </p>
                                    {app.listingId?.images?.length > 0 && (
                                        <div style={{ marginTop: 16 }}>
                                            <Carousel dots autoplay>
                                                {app.listingId.images.map((imgUrl, index) => (
                                                    <div key={index}>
                                                        <img
                                                            src={`${baseURL}${imgUrl}`}
                                                            alt={`Фото ${index + 1}`}
                                                            style={{
                                                                width: '400px',
                                                                height: 200,
                                                                objectFit: 'cover',
                                                                borderRadius: 8,
                                                                marginBottom: 8
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </Carousel>
                                        </div>
                                    )}
                                    <div style={{ marginBottom: 8 }}>
                                        <strong>Статус:</strong>{' '}
                                        <Tag color={getListingStatusColor(app.listingId?.status)}>
                                            {ListingStatusMapper[app.listingId?.status]}
                                        </Tag>
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <strong>Кількість людей:</strong>{' '}
                                        {app.listingId?.options?.people}
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <strong>Термін проживання:</strong>{' '}
                                        {periodMapper[app.listingId?.options?.term]}
                                    </div>
                                    <div>
                                        <strong>Координати:</strong> {app.listingId?.location?.lat},{' '}
                                        {app.listingId?.location?.lng}
                                    </div>
                                </div>
                                <Button
                                    type="primary"
                                    size="small"
                                    style={{ marginTop: 8 }}
                                    onClick={() => showMap(app.listingId?.location)}>
                                    Показати на мапі
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
            <Modal
                title="Місцезнаходження оголошення"
                open={isMapVisible}
                onCancel={closeMap}
                footer={null}
                width={600}>
                {isLoaded && mapCoords && (
                    <div style={{ height: '400px', width: '100%' }}>
                        <GoogleMap
                            center={{ lat: mapCoords.lat, lng: mapCoords.lng }}
                            zoom={15}
                            mapContainerStyle={{ height: '100%', width: '100%' }}>
                            <Marker position={{ lat: mapCoords.lat, lng: mapCoords.lng }} />
                        </GoogleMap>
                    </div>
                )}
            </Modal>
        </div>
    );
};
