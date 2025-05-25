import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="404"
            style={{ height: '100%' }}
            title="404"
            subTitle="Сторінку не знайдено."
            extra={
                <Button type="primary" onClick={() => navigate('/')}>
                    На головну
                </Button>
            }
        />
    );
};
