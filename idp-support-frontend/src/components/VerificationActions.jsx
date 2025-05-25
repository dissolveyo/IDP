import { Button, Input, Modal, Space } from 'antd';
import { useState } from 'react';

const { TextArea } = Input;

export const VerificationActions = ({ updateVerificationStatus }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [declineReason, setDeclineReason] = useState('');

    const handleApprove = () => {
        updateVerificationStatus('Approved');
    };

    const showDeclineModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setDeclineReason('');
    };

    const handleSubmitDecline = () => {
        updateVerificationStatus('Rejected', declineReason);
        setIsModalVisible(false);
        setDeclineReason('');
    };

    return (
        <>
            <Space>
                <Button type="primary" onClick={handleApprove}>
                    Схвалити
                </Button>
                <Button danger onClick={showDeclineModal}>
                    Відхилити
                </Button>
            </Space>

            <Modal
                title="Причина відхилення"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Відмінити
                    </Button>,
                    <Button key="submit" type="primary" danger onClick={handleSubmitDecline}>
                        Відправити
                    </Button>
                ]}>
                <TextArea
                    rows={4}
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Вкажіть причину відхилення"
                />
            </Modal>
        </>
    );
};
