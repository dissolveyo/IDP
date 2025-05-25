import { Layout as AntLayout } from 'antd';
import { Header } from './Header';
import { Footer } from './Footer';
import { Container } from './Container';
import { Outlet } from 'react-router';

const { Content } = AntLayout;

export const Layout = () => {
    return (
        <AntLayout
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f0f4ff 0%, #d6e4ff 100%)'
            }}>
            <Header />

            <Container style={{ padding: '24px', flex: 1 }}>
                <Content>
                    <Outlet />
                </Content>
            </Container>

            <Footer />
        </AntLayout>
    );
};
