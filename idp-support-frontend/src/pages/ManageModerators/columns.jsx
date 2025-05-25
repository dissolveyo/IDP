import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { userStatusMapper } from '@const/userStatus';
import { Button, Popconfirm, Space } from 'antd';
import dayjs from 'dayjs';

export const getColumns = ({ moderators, deleting, onAdd, onDelete, onEdit }) => [
    {
        title: 'Імʼя',
        dataIndex: 'firstName',
        key: 'firstName',
        sorter: (a, b) => a.firstName.localeCompare(b.firstName),
        filterSearch: true,
        onFilter: (value, record) => record.firstName.toLowerCase().includes(value.toLowerCase()),
        filters: moderators.map((m) => ({
            text: m.firstName,
            value: m.firstName
        }))
    },
    {
        title: 'Прізвище',
        dataIndex: 'lastName',
        key: 'lastName',
        sorter: (a, b) => a.lastName.localeCompare(b.lastName),
        onFilter: (value, record) => record.lastName.toLowerCase().includes(value.toLowerCase()),
        filterSearch: true,
        filters: moderators.map((m) => ({
            text: m.lastName,
            value: m.lastName
        }))
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        sorter: (a, b) => a.email.localeCompare(b.email),
        onFilter: (value, record) => record.email.toLowerCase().includes(value.toLowerCase()),
        filterSearch: true,
        filters: moderators.map((m) => ({
            text: m.email,
            value: m.email
        }))
    },
    {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
            let color = '';
            let background = '';
            let textColor = '#000';

            switch (status) {
                case 'Active':
                    background = '#d9f7be';
                    color = '#52c41a';
                    break;
                case 'Unverified':
                    background = '#fff3cd';
                    color = '#faad14';
                    break;
                case 'Suspended':
                    background = '#fff1f0';
                    color = '#f5222d';
                    break;
                default:
                    background = '#f5f5f5';
                    color = '#8c8c8c';
            }

            return (
                <span
                    style={{
                        background,
                        color: textColor,
                        padding: '4px 8px',
                        borderRadius: 8,
                        border: `1px solid ${color}`,
                        fontSize: 12,
                        fontWeight: 500
                    }}>
                    {userStatusMapper[status]}
                </span>
            );
        },
        filters: [
            { text: 'Активний', value: 'Active' },
            { text: 'Не верифікований', value: 'Unverified' },
            { text: 'Деактивований', value: 'Suspended' },
            { text: 'Видалений', value: 'Deleted' }
        ],
        onFilter: (value, record) => record.status === value
    },
    {
        title: 'Створений',
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        render: (value) => dayjs(value).format('DD.MM.YYYY HH:mm')
    },
    {
        title: 'Останнє оновлення',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
        render: (value) => dayjs(value).format('DD.MM.YYYY HH:mm')
    },
    {
        title: (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                <Button size="small" icon={<PlusOutlined />} type="primary" onClick={onAdd}>
                    Додати
                </Button>
            </div>
        ),
        key: 'actions',
        render: (record) => (
            <Space>
                <Button
                    loading={deleting}
                    icon={<EditOutlined />}
                    onClick={() => onEdit(record._id)}
                />
                {record?.status !== 'Deleted' && (
                    <Popconfirm
                        title="Видалення модератора"
                        styles={{ body: { width: '400px' } }}
                        description="Ви впевнені, що хочете видалити цього модератора? Це є безповоротна дія"
                        onConfirm={() => onDelete(record._id)}
                        okText="Так"
                        cancelText="Ні">
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                )}
            </Space>
        )
    }
];
