import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, 'src/components'),
            '@api': path.resolve(__dirname, 'src/api'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@const': path.resolve(__dirname, 'src/const'),
            '@store': path.resolve(__dirname, 'src/store'),
            '@router': path.resolve(__dirname, 'src/router'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@services': path.resolve(__dirname, 'src/services')
        }
    }
});
