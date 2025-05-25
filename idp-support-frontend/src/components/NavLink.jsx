import { Link, useLocation } from 'react-router';

export const NavLink = ({ to, children }) => {
    const location = useLocation();

    const getFirstSegment = (path) => path.split('/').filter(Boolean)[0];
    const isActive = getFirstSegment(location.pathname) === getFirstSegment(to);

    return (
        <Link
            to={to}
            style={{
                fontWeight: isActive ? 'bold' : 'normal',
                color: isActive ? '#1677ff' : 'inherit',
                transition: 'all 0.2s'
            }}>
            {children}
        </Link>
    );
};
