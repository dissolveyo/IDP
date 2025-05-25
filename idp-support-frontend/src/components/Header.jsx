import { Layout, Avatar, Dropdown, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import { Link } from 'react-router';
import { Menu } from './Menu';
import { userRoleMapper } from '@const/roles';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export const Header = () => {
    const user = useUserStore((state) => state.user);
    const clearUser = useUserStore((state) => state.clearUser);

    const handleLogout = () => {
        clearUser();
        localStorage.removeItem('token');
    };

    const menuItems = [
        {
            key: 'profile',
            label: <Link to="/profile">Профіль</Link>,
            icon: <ProfileOutlined />
        },
        {
            key: 'logout',
            label: <span onClick={handleLogout}>Вийти</span>,
            icon: <LogoutOutlined />
        }
    ];

    return (
        <AntHeader
            style={{
                background: '#fff',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/3103/3103459.png"
                    alt="logo"
                    width={32}
                    style={{ marginRight: 12 }}
                />
                <Text strong style={{ fontSize: 18 }}>
                    ShelterConnect
                </Text>
            </div>

            <Menu />

            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <div
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '4px 8px',
                        lineHeight: 1.2
                    }}>
                    <Avatar
                        style={{
                            flexShrink: 0
                        }}
                        src={
                            user?.avatar &&
                            `${import.meta.env.VITE_API_URL}${user?.avatar}?t=${Date.now()}`
                        }
                        icon={!user?.avatar && <UserOutlined />}
                        size={32}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                        <Text strong style={{ fontSize: 14, margin: 0 }}>
                            {user?.firstName} {user?.lastName}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11, margin: 0 }}>
                            {userRoleMapper[user?.role]}
                        </Text>
                    </div>
                </div>
            </Dropdown>
        </AntHeader>
    );
};
