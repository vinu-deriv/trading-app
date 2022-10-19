import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
const path = require('path');

export default defineConfig({
    plugins: [solidPlugin()],
    server: {
        port: 3003,
    },
    build: {
        target: 'esnext',
    },
    resolve: {
        alias: {
            Assets: path.resolve(__dirname, './src/assets'),
            Components: path.resolve(__dirname, './src/components'),
            Constants: path.resolve(__dirname, './src/constants'),
            Containers: path.resolve(__dirname, './src/containers'),
            Routes: path.resolve(__dirname, './src/routes'),
            Stores: path.resolve(__dirname, './src/stores'),
            Utils: path.resolve(__dirname, './src/utils'),
        },
    },
});
