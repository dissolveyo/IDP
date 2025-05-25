import { Badge } from 'antd';
import { useUserStore } from '@store/userStore';
import { useChatStore } from '@store/chatStore';
import { ROLES } from '@const/roles';
import { idpItems, landlordItems, moderatorItems, superUserItems } from './utils';
import { NavLink } from '@components/NavLink';
import { useMemo } from 'react';
import { Menu as AntMenu } from 'antd';

export const Menu = () => {
    const user = useUserStore((state) => state.user);
    const unreadCount = useChatStore((state) => state.unreadCount);

    const items = useMemo(() => {
        let roleItems = [];
        switch (user?.role) {
            case ROLES.LANDLORD:
                roleItems = landlordItems;
                break;
            case ROLES.SUPER_USER:
                roleItems = superUserItems;
                break;
            case ROLES.MODERATOR:
                roleItems = moderatorItems;
                break;
            case ROLES.IDP:
                roleItems = idpItems;
                break;
        }

        return roleItems.map((item) => ({
            key: item.key,
            label:
                item.key === 'chats' ? (
                    <Badge count={unreadCount} size="small" offset={[6, 0]}>
                        <NavLink to={item.path}>{item.label}</NavLink>
                    </Badge>
                ) : (
                    <NavLink to={item.path}>{item.label}</NavLink>
                )
        }));
    }, [user?.role, unreadCount]);

    return (
        <AntMenu
            mode="horizontal"
            style={{ flex: 1, marginLeft: 32 }}
            selectable={false}
            items={items}
        />
    );
};
