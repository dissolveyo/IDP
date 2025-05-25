import React, { useEffect, useState } from 'react';
import {
    Input,
    Select,
    Row,
    Col,
    Card,
    Typography,
    Spin,
    Rate,
    Modal,
    Button,
    Tag,
    Empty
} from 'antd';
import { ListingService } from '@services/ListingService';
import { baseURL } from '@api/index';
import { periodMapper } from '@const/periodMapper';
import { periodOptions } from '@const/periodOptions';
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router';
import { getListingStatusColor } from '@utils/index';
import { ListingStatusMapper } from '@const/listingStatusMapper';

const { Title, Text } = Typography;

const containerStyle = {
    width: '100%',
    height: '100%'
};

const centerDefault = { lat: 50.4501, lng: 30.5234 };

export const ViewListings = () => {
    const [listings, setListings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        address: '',
        people: '',
        term: '',
        rating: ''
    });
    const navigate = useNavigate();

    const [showMap, setShowMap] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
    });

    useEffect(() => {
        ListingService.getAllActiveListings()
            .then((res) => {
                setListings(res.data);
                setFiltered(res.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const filteredList = listings.filter((l) => {
            const searchMatch =
                l.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
                l.description?.toLowerCase().includes(filters.search.toLowerCase());
            const matchesAddress = l.address?.toLowerCase().includes(filters.address.toLowerCase());

            const peopleMatch = filters.people
                ? l?.options.people?.toString() === filters.people
                : true;

            const termMatch = filters.term ? l?.options?.term === filters.term : true;

            const ratingMatch = filters.rating
                ? Math.floor(l.averageRating || 0) === Number(filters.rating)
                : true;

            return searchMatch && peopleMatch && termMatch && ratingMatch && matchesAddress;
        });

        setFiltered(filteredList);
    }, [filters, listings]);

    const handleChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={3}>Оголошення</Title>
            <Row gutter={24}>
                <Col span={6}>
                    <div
                        style={{
                            background: '#fff',
                            padding: 16,
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                        <Title level={5}>Фільтри</Title>

                        <Input
                            placeholder="Пошук по назві або опису"
                            value={filters.search}
                            onChange={(e) => handleChange('search', e.target.value)}
                            style={{ marginBottom: 16 }}
                        />
                        <Input
                            placeholder="Пошук по адресі"
                            value={filters.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            style={{ marginBottom: 16 }}
                        />
                        <Input
                            placeholder="Кількість людей"
                            type="number"
                            min={1}
                            value={filters.people}
                            onChange={(e) => handleChange('people', e.target.value)}
                            style={{ marginBottom: 16 }}
                        />
                        <Select
                            placeholder="Тип оренди"
                            style={{ width: '100%', marginBottom: 16 }}
                            value={filters.term || undefined}
                            onChange={(val) => handleChange('term', val)}
                            options={periodOptions}
                            allowClear
                        />
                        <Select
                            placeholder="Мінімальний рейтинг"
                            style={{ width: '100%', marginBottom: 16 }}
                            value={filters.rating || undefined}
                            onChange={(val) => handleChange('rating', val)}
                            allowClear
                            options={[5, 4, 3, 2, 1].map((value) => ({
                                value: value.toString(),
                                label: <Rate disabled value={value} />
                            }))}
                        />

                        <Button
                            type="default"
                            style={{ marginTop: 8, width: '100%' }}
                            disabled={
                                !filters.search &&
                                !filters.address &&
                                !filters.people &&
                                !filters.term &&
                                !filters.rating
                            }
                            onClick={() => {
                                handleChange('search', '');
                                handleChange('address', '');
                                handleChange('people', '');
                                handleChange('term', undefined);
                                handleChange('rating', undefined);
                            }}>
                            Скинути фільтри
                        </Button>

                        <Button
                            type="primary"
                            style={{ marginTop: 16, width: '100%' }}
                            onClick={() => setShowMap(true)}>
                            Відобразити на мапі
                        </Button>
                    </div>
                </Col>

                <Col span={18}>
                    {loading ? (
                        <Spin />
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', width: '100%', marginTop: 40 }}>
                            <Empty
                                style={{ margin: '0' }}
                                description="За даними фільтрами оголошень не знайдено"
                            />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {filtered.map((item) => (
                                <div
                                    key={item._id}
                                    style={{
                                        background: '#fff',
                                        padding: 16,
                                        borderRadius: 8,
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                        display: 'flex',
                                        gap: 16,
                                        alignItems: 'flex-start'
                                    }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            height: '100%',
                                            gap: 8
                                        }}>
                                        <img
                                            alt="listing"
                                            src={`${baseURL}${item.images?.[0]}`}
                                            style={{
                                                width: 200,
                                                height: 150,
                                                objectFit: 'cover',
                                                borderRadius: 8
                                            }}
                                        />
                                        <div style={{ justifySelf: 'end' }}>
                                            <Text strong>Рейтинг: </Text>
                                            <Rate
                                                disabled
                                                allowHalf
                                                value={item.averageRating || 0}
                                                style={{ fontSize: 16 }}
                                            />
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                        <Title level={5} style={{ marginBottom: 8 }}>
                                            {item.title}
                                        </Title>
                                        <Text
                                            type="secondary"
                                            style={{ display: 'block', marginBottom: 8 }}>
                                            {item.description}
                                        </Text>
                                        <div style={{ marginBottom: 8 }}>
                                            <Text strong>Адреса: </Text>
                                            {item.address || '-'}
                                        </div>
                                        <div>
                                            <Text strong>Людей: </Text>
                                            {item.options?.people || '-'}
                                        </div>
                                        <div>
                                            <Text strong>Тип: </Text>
                                            {periodMapper[item?.options?.term] || '-'}
                                        </div>
                                        <div>
                                            <Text strong>Статус: </Text>
                                            <Tag
                                                color={getListingStatusColor(item.status)}
                                                style={{ fontSize: 13 }}>
                                                {ListingStatusMapper[item.status]}
                                            </Tag>
                                        </div>

                                        <Button
                                            type="primary"
                                            style={{
                                                marginTop: 'auto',
                                                alignSelf: 'flex-end'
                                            }}
                                            onClick={() => navigate(`/listings/${item._id}`)}>
                                            Перейти до оголошення
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Col>
            </Row>

            <Modal
                open={showMap}
                onCancel={() => setShowMap(false)}
                footer={null}
                width="100%"
                style={{ top: 0, padding: 0 }}
                styles={{ body: { height: '100vh', padding: 0 } }}
                centered
                destroyOnHidden>
                {!isLoaded ? (
                    <Spin style={{ width: '100%', marginTop: 100 }} />
                ) : (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={
                            filtered.length && filtered[0].location
                                ? filtered[0].location
                                : centerDefault
                        }
                        zoom={12}>
                        {filtered.map(
                            (item) =>
                                item.location && (
                                    <Marker
                                        key={item._id}
                                        position={item.location}
                                        onClick={() => setSelectedMarker(item)}
                                    />
                                )
                        )}

                        {selectedMarker && (
                            <InfoWindow
                                position={selectedMarker.location}
                                onCloseClick={() => setSelectedMarker(null)}>
                                <div style={{ maxWidth: 250 }}>
                                    {selectedMarker.images?.[0] && (
                                        <img
                                            src={`${baseURL}${selectedMarker.images[0]}`}
                                            alt={selectedMarker.title}
                                            style={{
                                                width: '100%',
                                                height: 120,
                                                objectFit: 'cover',
                                                borderRadius: 8,
                                                marginBottom: 8
                                            }}
                                        />
                                    )}

                                    <Title level={5} style={{ marginBottom: 4 }}>
                                        {selectedMarker.title}
                                    </Title>

                                    <Text style={{ display: 'block', marginBottom: 8 }}>
                                        {selectedMarker.description}
                                    </Text>

                                    <Rate
                                        disabled
                                        allowHalf
                                        value={selectedMarker.averageRating || 0}
                                    />

                                    <div style={{ marginTop: 12, textAlign: 'right' }}>
                                        <Button
                                            type="primary"
                                            onClick={() =>
                                                navigate(`/listings/${selectedMarker._id}`)
                                            }>
                                            Перейти на оголошення
                                        </Button>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                )}
            </Modal>
        </div>
    );
};
