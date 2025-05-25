import { Modal, Form, Input, Select, Button } from 'antd';

const { TextArea } = Input;

const complaintReasons = {
    comment: [
        { value: 'inappropriate_language', label: 'Ненормативна лексика' },
        { value: 'spam_comment', label: 'Спам' },
        { value: 'false_information', label: 'Неправдива інформація' },
        { value: 'harassment', label: 'Переслідування' },
        { value: 'off_topic', label: 'Не по темі' }
    ],
    listing: [
        { value: 'duplicate_listing', label: 'Дублювання оголошення' },
        { value: 'fraudulent_listing', label: 'Шахрайство' },
        { value: 'outdated_information', label: 'Застаріла інформація' },
        { value: 'incorrect_location', label: 'Невірне розташування' },
        { value: 'inappropriate_content', label: 'Неприйнятний контент' }
    ],
    chat: [
        { value: 'harassment_chat', label: 'Переслідування в чаті' },
        { value: 'scam_attempt', label: 'Спроба шахрайства' },
        { value: 'offensive_language', label: 'Образлива мова' },
        { value: 'irrelevant_messages', label: 'Недоречні повідомлення' },
        { value: 'unwanted_contact', label: 'Небажаний контакт' }
    ]
};

export const ComplaintModal = ({ open, loading, onCancel, onSubmit, type }) => {
    const [form] = Form.useForm();
    const reasons = [...complaintReasons[type], { value: 'other', label: 'Інше' }];

    const handleFinish = (values) => {
        onSubmit({ ...values, type });
        form.resetFields();
    };

    return (
        <Modal
            title="Нова скарга"
            loading={loading}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            footer={null}>
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="title"
                    label="Заголовок"
                    rules={[{ required: true, message: 'Введіть заголовок' }]}>
                    <Input />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Опис"
                    rules={[{ required: true, message: 'Введіть опис скарги' }]}>
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="reason"
                    label="Причина скарги"
                    rules={[{ required: true, message: 'Оберіть причину скарги' }]}>
                    <Select placeholder="Оберіть причину" options={reasons} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Надіслати скаргу
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};
