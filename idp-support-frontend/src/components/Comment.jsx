import { Rate, Typography } from 'antd';
const { Paragraph } = Typography;

export function Comment({ author, avatar, content, datetime, rating }) {
    return (
        <div style={{ display: 'flex', marginBottom: 16 }}>
            <img
                src={avatar}
                alt={author}
                style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }}
            />
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{author}</div>
                <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />
                <Paragraph style={{ marginTop: 4 }}>{content}</Paragraph>
                <div style={{ fontSize: 12, color: '#888' }}>{datetime}</div>
            </div>
        </div>
    );
}
