import { Layout, Typography, Space } from 'antd';
import dayjs from 'dayjs';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export const Footer = () => {
    return (
        <AntFooter
            style={{
                textAlign: 'center',
                background: 'transparent',
                padding: '12px 8px'
            }}>
            <Space direction="vertical" size={0}>
                <Text style={{ fontSize: 12, color: '#888' }}>
                    © {dayjs().year()} ShelterConnect
                </Text>
                <Text type="secondary" style={{ fontSize: 11, color: '#999' }}>
                    Платформа для пошуку житла та підтримки ВПО
                </Text>
            </Space>
        </AntFooter>
    );
};
