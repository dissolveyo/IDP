import { SessionProvider } from '@components/SessionProvider';
import { RouterProvider } from 'react-router';
import { router } from './router';
import { ToastContainer } from 'react-toastify';
import { IdleModalTimer } from '@components/IdleModalTimer';
import { LoadScript } from '@react-google-maps/api';
import { socket } from './socket';
import NotificationHandler from '@components/NotificationsHandler';
import { useUserStore } from '@store/userStore';
import { useEffect } from 'react';

function App() {
    const user = useUserStore((state) => state?.user);

    useEffect(() => {
        if (user?._id) {
            socket.emit('joinUser', { userId: user._id });
        }
    }, [user]);
    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY}>
            <SessionProvider>
                <NotificationHandler userId={user?._id} />
                <IdleModalTimer />
                <ToastContainer />
                <RouterProvider router={router} />
            </SessionProvider>
        </LoadScript>
    );
}

export default App;
