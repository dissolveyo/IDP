import { useUserStore } from '../../store/userStore';
import { ROLES } from '../../const/roles';
import { useMemo } from 'react';
import { ManageListings } from '@pages/ManageListings';
import { Analytics } from '@pages/Analytics';
import { Navigate } from 'react-router';
import { ViewVerifications } from '@pages/ViewVerifications';
import { ViewListings } from '@pages/ViewListings';

export const HomePage = () => {
    const user = useUserStore((state) => state.user);

    const page = useMemo(() => {
        switch (user?.role) {
            case ROLES.IDP:
                return <ViewListings />;
            case ROLES.LANDLORD:
                return <ManageListings />;
            case ROLES.SUPER_USER:
                return <Analytics />;
            case ROLES.MODERATOR:
                return <ViewVerifications />;
            default:
                return <Navigate to="/404" replace />;
        }
    }, [user?.role]);

    return page;
};
