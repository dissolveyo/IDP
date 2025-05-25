import { ArrowLeftOutlined } from '@ant-design/icons';
import { api } from '@api/index';
import { VerificationActions } from '@components/VerificationActions';
import { VerificationStatus, verificationStatusMapper } from '@const/verificationStatus';
import { FileService } from '@services/FileService';
import { VerificationService } from '@services/VerificationService';
import { getVerificationStatusColor } from '@utils/index';
import { Card, Descriptions, Image, Spin, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';

export const ViewVerification = () => {
    const { id } = useParams();
    const [verification, setVerification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageUrls, setImageUrls] = useState([]);
    const navigate = useNavigate();

    const initializeVerification = async (verification) => {
        setVerification(verification);

        const urls = await Promise.all(
            verification.files.map(async (filePath) => {
                const fileRes = await FileService.getVerificationFile(filePath);
                return URL.createObjectURL(fileRes.data);
            })
        );

        setImageUrls(urls);
    };

    useEffect(() => {
        const fetchVerification = async () => {
            try {
                const res = await api.get(`/api/verifications/${id}`);

                await initializeVerification(res?.data);
            } catch {
                toast('Не вдалось завантажити верифікацію', { type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchVerification();
    }, [id]);

    const updateVerificationStatus = async (status, declineReason) => {
        setLoading(true);
        try {
            const res = await VerificationService.updateVerificationStatus(verification?._id, {
                status,
                declineReason
            });

            await initializeVerification(res);

            toast(
                status === VerificationStatus.APPROVED
                    ? 'Верифікація була успішно схвалена'
                    : 'Верифікація була успішно відхилена',
                { type: 'success' }
            );
        } catch {
            toast('Не вдалось оновити верифікацію', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !verification) return <Spin spinning={loading} fullscreen />;

    const { createdAt, declineReason, status, reviewedAt, ocrExtracted, validationFlags, user } =
        verification;

    return (
        <Card
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
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
                        <span>Перегляд верифікації</span>
                    </div>
                    {status === VerificationStatus.PENDING && (
                        <VerificationActions updateVerificationStatus={updateVerificationStatus} />
                    )}
                </div>
            }
            style={{ maxWidth: 900, margin: '0 auto', marginTop: 32 }}>
            <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Користувач">
                    {user.firstName} {user.lastName} ({user.email})
                </Descriptions.Item>
                <Descriptions.Item label="Статус">
                    <Tag color={getVerificationStatusColor(status)}>
                        {verificationStatusMapper[status]}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Дата створення">
                    {new Date(createdAt).toLocaleString()}
                </Descriptions.Item>
                {reviewedAt && (
                    <Descriptions.Item label="Дата розгляду">
                        {new Date(reviewedAt).toLocaleString()}
                    </Descriptions.Item>
                )}
                {declineReason && (
                    <Descriptions.Item label="Причина відмови">{declineReason}</Descriptions.Item>
                )}
                {ocrExtracted?.passportNumber && (
                    <Descriptions.Item label="Розпізнаний номер паспорта">
                        {ocrExtracted.passportNumber}
                    </Descriptions.Item>
                )}
                {validationFlags?.ocrConflict && (
                    <Descriptions.Item label="OCR конфлікт">
                        Знайдено збіг з {validationFlags.ocrConflict.matchedVerificationId}
                    </Descriptions.Item>
                )}
                {validationFlags?.photoHashConflict && (
                    <Descriptions.Item label="Конфлікт зображення">
                        Тип: {validationFlags.photoHashConflict.matchedFileType}
                        <p>Hash: {validationFlags.photoHashConflict.matchedFileHash}</p>
                    </Descriptions.Item>
                )}
            </Descriptions>

            <div style={{ marginTop: 24 }}>
                <h3>Документи</h3>
                <Image.PreviewGroup>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {imageUrls.map((img, index) => (
                            <Image
                                key={index}
                                width={200}
                                src={img}
                                style={{ borderRadius: 8, objectFit: 'cover' }}
                            />
                        ))}
                    </div>
                </Image.PreviewGroup>
            </div>
        </Card>
    );
};
