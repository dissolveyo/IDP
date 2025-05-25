import {
    Button,
    Card,
    DatePicker,
    Empty,
    Input,
    List,
    Popconfirm,
    Select,
    Spin,
    Tag,
    Typography,
    message
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import dayjs from 'dayjs';
import { ListingService } from '@services/ListingService';
import { getListingStatusColor } from '@utils/index';
import { baseURL } from '@api/index';
import { toast } from 'react-toastify';
import { ListingStatusMapper } from '@const/listingStatusMapper';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { Title, Text } = Typography;

const { Option } = Select;
const { RangePicker } = DatePicker;

export const ManageListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState(null);
    const [titleFilter, setTitleFilter] = useState(null);
    const [dateRange, setDateRange] = useState([]);

    const onStatusChange = (value) => {
        setStatusFilter(value);
    };

    const onDateChange = (dates) => {
        setDateRange(dates);
    };

    const onTitleChange = (e) => {
        setTitleFilter(e.target.value);
    };

    const getMyListings = () => {
        setLoading(true);
        ListingService.getMyListings()
            .then((res) => {
                setListings(res.data);
            })
            .catch(() => {
                message.error('Не вдалося завантажити оголошення');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        getMyListings();
    }, []);

    const deleteListingById = (id) => {
        setIsDeleting(true);

        ListingService.deleteListingById(id)
            .then(() => {
                toast('Оголошення було успішно видалене', { type: 'success' });
                getMyListings();
            })
            .catch(() => {
                toast('Виникла помилка при видаленні оголошення', { type: 'error' });
            })
            .finally(() => setIsDeleting(false));
    };
    const toggleListingsStatus = (id) => {
        setIsDeleting(true);

        ListingService.toggleListingsStatus(id)
            .then(() => {
                toast('Статус оголошення було успішно оновленно', { type: 'success' });
                getMyListings();
            })
            .catch(() => {
                toast('Виникла помилка при оновленні статусу оголошення', { type: 'error' });
            })
            .finally(() => setIsDeleting(false));
    };

    const handleEdit = (id) => {
        navigate(`/listings/${id}`);
    };

    const handleAdd = () => {
        navigate('/create-listing');
    };

    const filteredListings = listings.filter((item) => {
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesTitle = titleFilter
            ? item.title.toLowerCase().includes(titleFilter.toLowerCase())
            : true;
        const matchesDate =
            dateRange?.length === 2
                ? dayjs(item.createdAt).isBetween(dateRange[0], dateRange[1], 'day', '[]')
                : true;

        return matchesStatus && matchesTitle && matchesDate;
    });

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24
                }}>
                <Title level={3}>Мої оголошення</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Додати оголошення
                </Button>
            </div>

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
                    <span style={{ marginRight: 8 }}>Назва:</span>
                    <Input
                        value={titleFilter}
                        onChange={onTitleChange}
                        placeholder="Пошук за назвою"
                        style={{ width: 200 }}
                    />
                </div>
                <div>
                    <span style={{ marginRight: 8 }}>Фільтрувати за датою:</span>
                    <RangePicker
                        //@ts-ignore
                        value={dateRange}
                        onChange={onDateChange}
                        format="DD.MM.YYYY"
                        allowClear
                    />
                </div>
                <div>
                    <span style={{ marginRight: 8 }}>Статус заявки:</span>
                    <Select
                        value={statusFilter}
                        onChange={onStatusChange}
                        allowClear
                        style={{ width: 180 }}
                        placeholder="Виберіть статус">
                        <Option value="Active">Активна</Option>
                        <Option value="Inactive">Призупинена</Option>
                    </Select>
                </div>
            </div>

            <Spin spinning={loading}>
                <List
                    dataSource={filteredListings}
                    locale={{ emptyText: <Empty description="Не знайдено жодного оголошення" /> }}
                    renderItem={(item) => (
                        <Spin spinning={isDeleting}>
                            <Card
                                key={item._id}
                                style={{
                                    marginBottom: 16,

                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow =
                                        '0 4px 12px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                styles={{ body: { padding: 18 } }}>
                                <div style={{ display: 'flex', gap: 24 }}>
                                    <div
                                        style={{
                                            width: 160,
                                            height: 100,
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: 8,
                                            overflow: 'hidden',
                                            flexShrink: 0
                                        }}>
                                        <img
                                            src={`${baseURL}${item.images?.[0]}`}
                                            alt="listing"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: 8
                                            }}>
                                            <Title level={5} style={{ margin: 0 }}>
                                                {item.title}
                                            </Title>
                                            <Tag
                                                color={getListingStatusColor(item.status)}
                                                style={{ fontSize: 13 }}>
                                                {ListingStatusMapper[item.status]}
                                            </Tag>
                                        </div>

                                        <Text
                                            type="secondary"
                                            style={{ display: 'block', marginBottom: 6 }}>
                                            {item.description}
                                        </Text>

                                        <Text style={{ display: 'block' }}>
                                            <strong>Адреса:</strong> {item.address}
                                        </Text>

                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Створено:{' '}
                                            {dayjs(item.createdAt).format('DD.MM.YYYY HH:mm')}
                                        </Text>

                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: 8,
                                                justifyContent: 'space-between',
                                                marginTop: 12
                                            }}>
                                            {item?.status !== 'Suspended' ? (
                                                <Button
                                                    icon={
                                                        item?.status === 'Active' ? (
                                                            <PauseCircleOutlined />
                                                        ) : (
                                                            <PlayCircleOutlined />
                                                        )
                                                    }
                                                    onClick={() => toggleListingsStatus(item._id)}>
                                                    {item?.status === 'Inactive' && 'Активувати'}

                                                    {item?.status === 'Active' && 'Деактивувати'}
                                                </Button>
                                            ) : (
                                                <div></div>
                                            )}

                                            <div style={{ display: 'flex', gap: 16 }}>
                                                <Button
                                                    icon={<EditOutlined />}
                                                    onClick={() => handleEdit(item._id)}>
                                                    Редагувати
                                                </Button>
                                                <Popconfirm
                                                    title="Видалити це оголошення?"
                                                    onConfirm={() => deleteListingById(item._id)}
                                                    okText="Так"
                                                    cancelText="Ні">
                                                    <Button danger icon={<DeleteOutlined />}>
                                                        Видалити
                                                    </Button>
                                                </Popconfirm>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Spin>
                    )}
                />
            </Spin>
        </div>
    );
};
