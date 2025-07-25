import path from 'node:path';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';

export default defineConfig({
    plugins: [
        electron([
            {
                // Main process
                entry: 'electron/main.ts',
                vite: {
                    build: {
                        outDir: 'dist-electron/main',
                    },
                },
            },
            {
                // Preload script
                entry: path.join(__dirname, 'electron/preload.ts'),
                vite: {
                    build: {
                        outDir: 'dist-electron/preload',
                    },
                },
            }
        ])
    ],
    resolve: {
        alias: [{ find: "@", replacement: "/src" }],
    },
    base: '/',
});
