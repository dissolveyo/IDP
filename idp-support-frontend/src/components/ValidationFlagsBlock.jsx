import { Tag } from 'antd';
import { Link } from 'react-router';

export const ValidationFlagsBlock = ({ flags, declineReason }) => {
    if (!flags && !declineReason) return null;

    const hasIssues =
        flags.photoHashConflict?.matchedVerificationId ||
        flags.ocrConflict?.matchedVerificationId ||
        declineReason;

    if (!hasIssues)
        return (
            <p>
                <strong>Валідація:</strong> Проблем не виявлено
            </p>
        );

    return (
        <div
            style={{
                borderRadius: 8,
                fontFamily: 'Arial, sans-serif'
            }}>
            <p style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>
                ⚠️ Проблеми з валідацією:
            </p>

            <div style={{ display: 'flex', width: '100%', gap: 24 }}>
                {flags.photoHashConflict?.matchedVerificationId && (
                    <div
                        style={{
                            borderLeft: '4px solid #f5222d',
                            backgroundColor: '#fff1f0',
                            padding: '10px 16px',
                            marginBottom: 12,
                            flexGrow: 1,
                            borderRadius: 4
                        }}>
                        <Tag color="red" style={{ marginBottom: 8 }}>
                            Photo Hash Conflict
                        </Tag>
                        <p style={{ margin: '4px 0' }}>
                            Збіг з верифікацією:{' '}
                            <Link
                                to={`/verifications/${flags.photoHashConflict.matchedVerificationId}`}
                                style={{ color: '#f5222d', textDecoration: 'underline' }}>
                                {flags.photoHashConflict.matchedVerificationId}
                            </Link>
                        </p>
                        <p style={{ margin: '4px 0' }}>
                            Тип файлу: {flags.photoHashConflict.matchedFileType}
                        </p>
                    </div>
                )}

                {flags.ocrConflict?.matchedVerificationId && (
                    <div
                        style={{
                            borderLeft: '4px solid #fa8c16',
                            backgroundColor: '#fff7e6',
                            padding: '10px 16px',
                            marginBottom: 12,
                            borderRadius: 4,
                            flexGrow: 1
                        }}>
                        <Tag color="orange" style={{ marginBottom: 8 }}>
                            OCR Conflict
                        </Tag>
                        <p style={{ margin: '4px 0' }}>
                            Збіг з верифікацією:{' '}
                            <Link
                                to={`/verifications/${flags.ocrConflict.matchedVerificationId}`}
                                style={{ color: '#fa8c16', textDecoration: 'underline' }}>
                                {flags.ocrConflict.matchedVerificationId}
                            </Link>
                        </p>
                        <p style={{ margin: '4px 0' }}>
                            Паспорт №: {flags.ocrConflict.matchedPassportNumber}
                        </p>
                    </div>
                )}
            </div>

            {declineReason && (
                <div
                    style={{
                        borderLeft: '4px solid #1890ff',
                        backgroundColor: '#e6f7ff',
                        padding: '10px 16px',
                        borderRadius: 4
                    }}>
                    <Tag color="blue" style={{ marginBottom: 8 }}>
                        Коментар
                    </Tag>
                    <p style={{ margin: 0 }}>{declineReason}</p>
                </div>
            )}
        </div>
    );
};
