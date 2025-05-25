import React, { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import 'antd/dist/reset.css';
import './index.css';
import App from './App';
import { ConfigProvider } from 'antd';
import ukUA from 'antd/es/locale/uk_UA';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ConfigProvider
            locale={ukUA}
            theme={{
                token: {
                    fontFamily: "'Poppins', sans-serif"
                }
            }}>
            <App />
        </ConfigProvider>
    </StrictMode>
);
