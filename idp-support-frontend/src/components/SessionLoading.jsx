import { Typography, Image } from 'antd';

const { Title, Text } = Typography;

export const SessionLoading = () => {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f0f4ff 0%, #d6e4ff 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                padding: 24,
                textAlign: 'center'
            }}>
            <Image
                width={120}
                preview={false}
                src="https://cdn-icons-png.flaticon.com/512/484/484167.png"
                alt="refugee-home"
                style={{ marginBottom: 24 }}
            />

            <Title level={3}>Перевіряємо вашу сесію...</Title>
            <Text type="secondary">
                Будь ласка, зачекайте кілька секунд, поки ми виконуємо авторизацію.
                <br />
                Після успішної перевірки вас буде повернуто на сторінку, яку ви намагались відкрити.
            </Text>
        </div>
    );
};
