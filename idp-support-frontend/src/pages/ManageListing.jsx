import {
    Button,
    Carousel,
    Col,
    Input,
    Row,
    Space,
    Typography,
    Form,
    Spin,
    Select,
    Tag,
    Modal,
    Tooltip,
    Popconfirm
} from 'antd';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { ListingService } from '@services/ListingService';
import { baseURL } from '@api/index';
import { periodMapper } from '@const/periodMapper';
import { periodOptions } from '@const/periodOptions';
import { ApiOutlined, ArrowLeftOutlined, RedoOutlined, WarningOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { getListingStatusColor } from '@utils/index';
import { ListingStatusMapper } from '@const/listingStatusMapper';
import { useUserStore } from '@store/userStore';
import { ROLES } from '@const/roles';
import { RatingService } from '@services/RatingService';
import { ApplicationService } from '@services/ApplicationService';
import { ReviewsBlock } from '@components/ReviewsBlock';
import { ComplaintModal } from '@components/ComplaintModal';
import { ComplaintService } from '@services/ComplaintService';
import { ChatService } from '@services/ChatService';

const { Title, Paragraph, Text } = Typography;

export const ManageListing = () => {
    const [editMode, setEditMode] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const [markerPosition, setMarkerPosition] = useState(null);
    const user = useUserStore((state) => state.user);
    const [ratings, setRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(false);
    const [loadingApplication, setLoadingApplication] = useState(false);
    const [complaintModal, setComplaintModal] = useState(false);
    const [complaintLoading, setComplaintLoading] = useState(false);

    const [form] = Form.useForm();
    const location = Form.useWatch('location', { form, preserve: true });
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [isApplicable, setIsApplicable] = useState(false);

    const [isAllowedToRate, setIsAllowedToRate] = useState(false);

    const isAllowedToEdit = user?._id === listing?.landlordId && user?.role === ROLES.LANDLORD;

    useEffect(() => {
        if (user?.role !== ROLES.IDP) return;

        setLoadingApplication(true);

        ApplicationService.hasPendingApplication({ listingId: id })
            .then(({ data }) => {
                setIsApplicable(!data?.hasPending);
            })
            .catch(() => {
                setIsApplicable(true);
            })
            .finally(() => setLoadingApplication(false));
    }, [id]);

    useEffect(() => {
        if (user?.role !== ROLES.IDP) return;

        setLoadingRatings(true);

        RatingService.getIsAllowedToRate({ listingId: id })
            .then(({ data }) => {
                setIsAllowedToRate(data?.allowed);
            })
            .catch(() => {
                setIsAllowedToRate(false);
            })
            .finally(() => setLoadingRatings(false));
    }, [id]);

    const initializeForm = (listing) => {
        setListing(listing);
        form.setFieldsValue({
            title: listing.title,
            description: listing.description,
            people: listing.options.people,
            term: listing.options?.term,
            address: listing.address,
            location: listing?.location
        });

        if (listing?.location) {
            setMarkerPosition({ lat: listing.location.lat, lng: listing.location.lng });
        }
    };

    const getListingById = () => {
        ListingService.getListingById(id).then(({ data }) => {
            initializeForm(data);
        });
    };

    useEffect(() => {
        getListingById();
    }, [id, form]);

    const getRatings = () => {
        setLoadingRatings(true);
        RatingService.getRatingsByListing(listing._id)
            .then(({ data }) => {
                setRatings(data);
            })
            .catch(() => {
                toast('Не вдалося завантажити відгуки', { type: 'error' });
            })
            .finally(() => setLoadingRatings(false));
    };

    useEffect(() => {
        if (!listing) return;

        getRatings();
    }, [listing]);

    const handleSave = async () => {
        form.validateFields().then((values) => {
            setLoading(true);
            const location = form.getFieldValue('location');

            ListingService.updateListing(id, { ...values, location })
                .then(({ data }) => {
                    initializeForm(data);
                    setEditMode(false);
                    setShowMap(false);

                    toast('Оголошення було успішно оновленно', { type: 'success' });
                })
                .catch(() => {
                    toast('Виникла помилка при оновленні оголошення', { type: 'error' });
                })
                .finally(() => setLoading(false));
        });
    };

    const handleMessageLandlord = async () => {
        try {
            setLoading(true);
            const response = await ChatService.createChat({
                landlordId: listing.landlordId,
                idpId: user._id,
                listingId: listing?._id
            });

            const chatId = response.data._id;

            navigate(`/chats/${chatId}`);
        } catch (error) {
            console.error('Помилка при створенні чату:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        const loc = listing?.location;

        form.setFieldsValue({
            title: listing.title,
            description: listing.description,
            people: listing.options.people,
            term: listing.options?.term,
            address: listing.address,
            location: loc
        });

        if (loc?.lat && loc?.lng) {
            setMarkerPosition({ lat: loc.lat, lng: loc.lng });
        } else {
            setMarkerPosition(null);
        }
    };

    const createApplication = (message) => {
        setLoadingApplication(true);

        ApplicationService.createApplication({
            message,
            landlordId: listing?.landlordId,
            listingId: id
        })
            .then(() => {
                toast('Ви успішно відправили заявку на проживання', { type: 'success' });
                setIsApplicable(false);
            })
            .catch(() => {
                toast('Виникла помилка при створенні заявки', { type: 'error' });
            })
            .finally(() => setLoadingApplication(false));
    };

    if (!listing || loading) {
        return <Spin fullscreen />;
    }

    const getTooltipText = () => {
        if (!isApplicable)
            return 'Ви вже надіслали заявку на це оголошення. Очікуйте відповіді від власника.';

        if (!user?.isDocumentsVerified)
            return 'Вам потрібно пройти процес верифікації перед відправленням заявок. Відвідайте ваш профіль';

        return null;
    };

    const isMyListing = listing?.landlordId === user?._id;

    const createComplaint = (values) => {
        setComplaintLoading(true);

        const listingId = listing?._id;
        const complainantId = user._id;

        ComplaintService.createComplaint({ ...values, complainantId, listingId })
            .then(() => {
                toast('Ваша скарга успішно надіслана. Дякуємо, що покращуєте спільноту', {
                    type: 'success'
                });
                setComplaintModal(false);
            })
            .catch(() => {
                toast('Виникла помилка при створенні скаргм', {
                    type: 'error'
                });
            })
            .finally(() => setComplaintLoading(false));
    };

    const suspendListing = () => {
        setLoading(true);
        ListingService.suspendListing(id)
            .then(() => {
                toast('Оголошення було тимчасово деактивовано', { type: 'success' });
                getListingById();
            })
            .catch(() => {
                toast('Виникла помилка при деактивуванні оголошення', { type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    const activateListing = () => {
        setLoading(true);
        ListingService.activateListing(id)
            .then(() => {
                toast('Оголошення було активовано', { type: 'success' });
                getListingById();
            })
            .catch(() => {
                toast('Виникла помилка при активування оголошення', { type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    return (
        <div
            style={{
                maxWidth: 900,
                margin: 'auto',
                padding: 24,
                backgroundColor: '#fff',
                borderRadius: 16
            }}>
            <Space
                style={{ marginBottom: 24, justifyContent: 'space-between', width: '100%' }}
                align="center">
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16
                    }}>
                    <ArrowLeftOutlined
                        onClick={() => navigate(-1)}
                        style={{ cursor: 'pointer', fontSize: 16 }}
                    />
                    <Title level={3} style={{ margin: 0 }}>
                        Оголошення
                    </Title>
                    <Button onClick={() => setShowMap(!showMap)}>
                        {showMap ? 'Сховати мапу' : 'Показати на мапі'}
                    </Button>
                </div>
                {isAllowedToEdit && (
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Button
                            onClick={() => {
                                if (editMode) {
                                    handleCancel();
                                }
                                setEditMode(!editMode);
                            }}>
                            {editMode ? 'Скасувати' : 'Редагувати'}
                        </Button>
                        {editMode && (
                            <Button type="primary" onClick={handleSave}>
                                Зберегти
                            </Button>
                        )}
                    </div>
                )}

                {!isMyListing && ['Landlord', 'IDP'].includes(user?.role) && (
                    <Tooltip title="Поскаржитись">
                        <Button
                            type="text"
                            icon={<WarningOutlined />}
                            onClick={() => {
                                setComplaintModal(true);
                            }}
                        />
                    </Tooltip>
                )}

                {user?.role === 'Moderator' &&
                    (listing.status === 'Active' || listing?.status === 'Inactive') && (
                        <Tooltip title="Деактивувати">
                            <Popconfirm
                                title="Ви впевнені, що хочете деактивувати оголошення?"
                                onConfirm={suspendListing}
                                okText="Так"
                                cancelText="Ні">
                                <Button type="text" icon={<ApiOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    )}

                {user?.role === 'Moderator' && listing.status === 'Suspended' && (
                    <Tooltip title="Активуавти">
                        <Popconfirm
                            title="Ви впевнені, що хочете активувати оголошення?"
                            onConfirm={activateListing}
                            okText="Так"
                            cancelText="Ні">
                            <Button type="text" icon={<RedoOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                )}
            </Space>

            <Spin spinning={loadingApplication}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <Carousel dots adaptiveHeight>
                            {listing.images.map((src, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: '100%',
                                        height: 400,
                                        overflow: 'hidden',
                                        borderRadius: 16
                                    }}>
                                    <img
                                        src={`${baseURL}${src}`}
                                        alt={`Photo ${i + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: 16
                                        }}
                                    />
                                </div>
                            ))}
                        </Carousel>
                    </Col>

                    <Col xs={24} md={12}>
                        {editMode ? (
                            <Form form={form} layout="vertical" initialValues={listing}>
                                <Form.Item
                                    label="Назва"
                                    name="title"
                                    rules={[{ required: true, message: 'Вкажіть назву' }]}>
                                    <Input placeholder="Назва" />
                                </Form.Item>

                                <Form.Item
                                    label="Опис"
                                    name="description"
                                    rules={[{ required: true, message: 'Вкажіть опис' }]}>
                                    <Input.TextArea rows={5} placeholder="Опис" />
                                </Form.Item>

                                <Form.Item
                                    label="Кількість осіб"
                                    name="people"
                                    rules={[
                                        { required: true, message: 'Вкажіть кількість осіб' },
                                        {
                                            type: 'number',
                                            min: 1,
                                            message: 'Кількість осіб має бути принаймні 1',
                                            transform: (value) => Number(value)
                                        }
                                    ]}>
                                    <Input type="number" min={1} />
                                </Form.Item>

                                <Form.Item
                                    label="Період проживання"
                                    name="term"
                                    rules={[{ required: true, message: 'Виберіть період' }]}>
                                    <Select options={periodOptions} placeholder="Оберіть період" />
                                </Form.Item>

                                <Form.Item
                                    label="Адреса"
                                    name="address"
                                    rules={[{ required: true, message: 'Вкажіть адресу' }]}>
                                    <Input placeholder="Адреса" />
                                </Form.Item>
                            </Form>
                        ) : (
                            <>
                                <Tag
                                    color={getListingStatusColor(listing.status)}
                                    style={{
                                        fontSize: 14,
                                        padding: '4px 12px',
                                        height: 'auto',
                                        borderRadius: 8,
                                        lineHeight: 1.4,
                                        fontWeight: 500,
                                        marginBottom: '16px'
                                    }}>
                                    {ListingStatusMapper[listing.status]}
                                </Tag>
                                <Title level={4}>{listing.title}</Title>
                                <Paragraph>{listing.description}</Paragraph>

                                <Text>
                                    <b>Кількість осіб:</b> {listing.options.people}
                                </Text>
                                <br />
                                <Text>
                                    <b>Період проживання:</b> {periodMapper[listing.options.term]}
                                </Text>
                                <br />
                                <Text>
                                    <b>Адреса:</b> {listing.address}
                                </Text>
                                <br />
                                <Text type="secondary">
                                    <b>Координати:</b>{' '}
                                    {location
                                        ? `(${markerPosition.lat.toFixed(
                                              5
                                          )}, ${markerPosition.lng.toFixed(5)})`
                                        : 'не вказано'}
                                </Text>
                                {listing?.status === 'Active' && user?.role === ROLES.IDP && (
                                    <>
                                        <br />
                                        <Tooltip title={getTooltipText()}>
                                            <span>
                                                <Button
                                                    style={{ marginTop: '10px' }}
                                                    type="primary"
                                                    onClick={() => setShowApplicationModal(true)}
                                                    disabled={!!getTooltipText()}>
                                                    {isApplicable
                                                        ? 'Надіслати заявку'
                                                        : 'Надіслано'}
                                                </Button>
                                            </span>
                                        </Tooltip>
                                    </>
                                )}

                                {listing?.status === 'Active' &&
                                    user?.role === ROLES.IDP &&
                                    !isApplicable && (
                                        <>
                                            <br />
                                            <Button
                                                style={{ marginTop: '10px' }}
                                                type="default"
                                                onClick={handleMessageLandlord}>
                                                Написати власнику
                                            </Button>
                                        </>
                                    )}
                            </>
                        )}
                    </Col>
                </Row>
            </Spin>

            <Modal
                title="Надіслати заявку"
                open={showApplicationModal}
                onCancel={() => setShowApplicationModal(false)}
                footer={null}>
                <Form
                    layout="vertical"
                    style={{ marginTop: 16 }}
                    onFinish={(values) => {
                        createApplication(values?.message);
                        setShowApplicationModal(false);
                    }}>
                    <Form.Item name="message" label="Повідомлення" required>
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" style={{ marginTop: 8 }}>
                        Надіслати
                    </Button>

                    <Button
                        onClick={() => setShowApplicationModal(false)}
                        danger
                        htmlType="submit"
                        style={{ marginTop: 8, marginLeft: 8 }}>
                        Закрити
                    </Button>
                </Form>
            </Modal>

            {showMap && (
                <div style={{ marginTop: 32 }}>
                    <GoogleMap
                        mapContainerStyle={{
                            width: '100%',
                            height: '400px',
                            borderRadius: 12
                        }}
                        center={markerPosition || { lat: 50.4501, lng: 30.5234 }}
                        zoom={13}
                        onClick={(e) => {
                            if (!editMode) return;
                            const pos = {
                                lat: e.latLng.lat(),
                                lng: e.latLng.lng()
                            };
                            form.setFieldValue('location', pos);
                            setMarkerPosition(pos);
                        }}>
                        {markerPosition && <Marker position={markerPosition} />}
                    </GoogleMap>
                    {markerPosition && (
                        <Text style={{ display: 'block', marginTop: 8 }}>
                            Мітка: {markerPosition.lat.toFixed(5)}, {markerPosition.lng.toFixed(5)}
                        </Text>
                    )}
                </div>
            )}

            {complaintModal && (
                <ComplaintModal
                    type="listing"
                    loading={complaintLoading}
                    onSubmit={(values) => createComplaint(values)}
                    open={complaintModal}
                    onCancel={() => setComplaintModal(false)}
                />
            )}

            <ReviewsBlock
                listing={listing}
                loadingRatings={loadingRatings}
                isAllowedToRate={isAllowedToRate}
                ratings={ratings}
                refetch={getRatings}
            />
        </div>
    );
};
