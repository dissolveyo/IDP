import { Empty } from 'antd';

const NoReviews = () => {
    return (
        <div
            style={{
                padding: '48px 0',
                textAlign: 'center',
                backgroundColor: '#fafafa',
                borderRadius: 12,
                border: '1px dashed #d9d9d9'
            }}>
            <Empty description={<span>На жаль, це оголошення ще не має відгуків</span>} />
        </div>
    );
};

export default NoReviews;
