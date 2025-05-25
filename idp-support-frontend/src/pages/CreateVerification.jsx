import React, { useState } from 'react';
import { Form, Upload, Button, message, Card, Alert, Checkbox } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { VerificationService } from '@services/VerificationService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { routes } from '@router/routes';

export const CreateVerification = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        const { certificate, passport_front, passport_back } = values;

        if (!certificate?.file || !passport_front?.file || !passport_back?.file) {
            message.error('Будь ласка, додайте всі документи');
            return;
        }

        const formData = new FormData();
        formData.append('certificate', certificate.file);
        formData.append('passport_front', passport_front.file);
        formData.append('passport_back', passport_back.file);

        setLoading(true);

        try {
            await VerificationService.createVerification(formData);
            setSuccess(true);
            toast('Верифікація надіслана успішно', { type: 'success' });
            form.resetFields();
        } catch {
            toast('Щось пішло не так при створенні верифікації', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const normFile = (e) => (Array.isArray(e) ? e : e?.fileList?.[0] ? e : null);

    return (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ArrowLeftOutlined
                        onClick={() => navigate(-1)}
                        style={{ cursor: 'pointer', fontSize: 16 }}
                    />
                    <span>Запит на верифікацію</span>
                </div>
            }
            style={{ maxWidth: 600, margin: '0 auto' }}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label="Довідка ВПО"
                    name="certificate"
                    valuePropName="file"
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: 'Завантажте файл довідки' }]}>
                    <Upload beforeUpload={() => false} maxCount={1} accept="image/jpeg,image/png">
                        <Button icon={<UploadOutlined />}>Вибрати файл</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    label="Паспорт (передня сторона)"
                    name="passport_front"
                    valuePropName="file"
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: 'Завантажте передню сторону паспорта' }]}>
                    <Upload beforeUpload={() => false} maxCount={1} accept="image/jpeg,image/png">
                        <Button icon={<UploadOutlined />}>Вибрати файл</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    label="Паспорт (задня сторона)"
                    name="passport_back"
                    valuePropName="file"
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: 'Завантажте задню сторону паспорта' }]}>
                    <Upload beforeUpload={() => false} maxCount={1} accept="image/jpeg,image/png">
                        <Button icon={<UploadOutlined />}>Вибрати файл</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                        {
                            validator: (_, value) =>
                                value
                                    ? Promise.resolve()
                                    : Promise.reject('Ви повинні погодитись з умовами')
                        }
                    ]}>
                    <Checkbox>Я погоджуюсь на обробку персональних даних</Checkbox>
                </Form.Item>

                <Form.Item>
                    <Button
                        disabled={success}
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block>
                        {loading ? 'Відправка...' : 'Надіслати'}
                    </Button>
                </Form.Item>
            </Form>

            {success && (
                <Card title="Результат верифікації" style={{ marginTop: 24 }}>
                    <Alert
                        message="Верифікація успішно створена"
                        description={
                            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                                <p>
                                    ✅ <strong>Заявку прийнято!</strong> Вона буде розглянута
                                    найближчим часом.
                                </p>
                                <p>
                                    📂 Стежте за статусом у{' '}
                                    <span
                                        onClick={() => navigate(routes.EDIT_PROFILE)}
                                        style={{
                                            fontWeight: 'bold',
                                            color: '#1677ff',
                                            cursor: 'pointer'
                                        }}>
                                        історії верифікацій
                                    </span>
                                    .
                                </p>
                                <p>
                                    ✉️ Ви також отримаєте <strong>електронного листа</strong> після
                                    рішення модератора.
                                </p>
                            </div>
                        }
                        type="success"
                        showIcon
                    />
                </Card>
            )}
        </Card>
    );
};
