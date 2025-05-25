import { Navigate, Outlet } from 'react-router';
import { useUserStore } from '../store/userStore';

export const PrivateRoute = ({ allowedRoles = [] }) => {
    const user = useUserStore((state) => state.user);
    const sessionChecked = useUserStore((state) => state.sessionChecked);

    if (!sessionChecked) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/404" replace />;
    }

    return <Outlet />;
};
