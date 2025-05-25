import {
    Button,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    Typography,
    Space,
    Modal,
    Spin,
    Row,
    Col
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { ListingService } from '@services/ListingService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { routes } from '@router/routes';
import { periodOptions } from '@const/periodOptions';

const { Title } = Typography;
const { TextArea } = Input;

export const CreateListing = () => {
    const [fileList, setFileList] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [markerPosition, setMarkerPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
    });

    if (loadError) return <div>Помилка завантаження карти</div>;
    if (!isLoaded) return <div>Завантаження карти…</div>;

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url?.substring(file.url.lastIndexOf('/') + 1));
    };

    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const handleReset = () => {
        form.resetFields();
        setMarkerPosition(null);
        setFileList([]);
    };

    const handleSubmit = async (values) => {
        const formData = new FormData();

        if (markerPosition) {
            formData.append('latitude', markerPosition.lat);
            formData.append('longitude', markerPosition.lng);
        }

        fileList.forEach((file) => {
            formData.append('photos', file.originFileObj);
        });

        Object.entries(values).forEach(([key, val]) => {
            if (
                key !== 'photos' &&
                key !== 'latitude' &&
                key !== 'longitude' &&
                key !== 'location'
            ) {
                formData.append(key, val);
            }
        });

        setLoading(true);

        try {
            const res = await ListingService.createListing(formData);
            toast('Оголошення успішно створено', { type: 'success' });
            navigate(routes.MANAGE_LISTING.replace(':id', res.data._id));
        } catch {
            toast('Виникла помилка при створенні оголошення', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };
    return (
        <Spin spinning={loading}>
            <div
                style={{
                    maxWidth: 700,
                    margin: '0 auto',
                    padding: 24,
                    backgroundColor: '#fff',
                    borderRadius: 18
                }}>
                <Title level={3}>Створити оголошення</Title>

                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Назва"
                        name="title"
                        rules={[{ required: true, message: 'Введіть назву' }]}>
                        <Input placeholder="Наприклад, Будинок біля лісу" />
                    </Form.Item>
                    <Form.Item
                        label="Опис"
                        name="description"
                        rules={[{ required: true, message: 'Введіть опис' }]}>
                        <TextArea rows={4} placeholder="Опис приміщення, зручності тощо" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Кількість осіб"
                                name="people"
                                rules={[{ required: true, message: 'Вкажіть кількість осіб' }]}>
                                <InputNumber min={1} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="Період проживання"
                                name="term"
                                rules={[{ required: true, message: 'Виберіть період' }]}>
                                <Select options={periodOptions} placeholder="Оберіть період" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        label="Адреса"
                        name="address"
                        rules={[{ required: true, message: 'Вкажіть адресу' }]}>
                        <Input placeholder="Наприклад, м. Львів, вул. Шевченка, 12" />
                    </Form.Item>
                    <Form.Item
                        label="Розташування на карті"
                        name="location"
                        rules={[
                            { required: true, message: 'Будь ласка, встановіть мітку на карті' }
                        ]}
                        getValueFromEvent={() => markerPosition}>
                        <div
                            style={{
                                height: '300px',
                                width: '100%',
                                borderRadius: 12,
                                overflow: 'hidden'
                            }}>
                            <GoogleMap
                                mapContainerStyle={{ height: '100%', width: '100%' }}
                                center={markerPosition || { lat: 50.4501, lng: 30.5234 }}
                                zoom={13}
                                onClick={(e) => {
                                    const pos = {
                                        lat: e.latLng.lat(),
                                        lng: e.latLng.lng()
                                    };
                                    setMarkerPosition(pos);
                                    form.setFieldsValue({ location: pos });
                                }}>
                                {markerPosition && <Marker position={markerPosition} />}
                            </GoogleMap>
                        </div>
                        {markerPosition ? (
                            <div style={{ marginTop: 8 }}>
                                Вибрано: широта {markerPosition.lat.toFixed(5)}, довгота{' '}
                                {markerPosition.lng.toFixed(5)}
                            </div>
                        ) : (
                            <div style={{ marginTop: 8, color: 'gray' }}>
                                Натисніть на карту, щоб встановити мітку
                            </div>
                        )}
                    </Form.Item>
                    <Form.Item
                        label="Фотографії"
                        name="photos"
                        rules={[
                            {
                                validator: () =>
                                    fileList.length > 0
                                        ? Promise.resolve()
                                        : Promise.reject(
                                              new Error('Будь ласка, додайте хоча б одне фото')
                                          )
                            }
                        ]}
                        getValueFromEvent={() => fileList}>
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            beforeUpload={() => false}
                            onChange={(info) => {
                                setFileList(info.fileList);
                                form.setFieldsValue({ photos: info.fileList });
                            }}
                            onPreview={handlePreview}
                            accept="image/jpeg,image/png">
                            {fileList.length < 7 && (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Завантажити</div>
                                </div>
                            )}
                        </Upload>

                        <Modal
                            open={previewVisible}
                            title={previewTitle}
                            footer={null}
                            onCancel={() => setPreviewVisible(false)}>
                            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
                        </Modal>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Створити
                            </Button>
                            <Button type="default" onClick={handleReset}>
                                Очистити
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>
        </Spin>
    );
};
