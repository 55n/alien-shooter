import react from '@vitejs/plugin-react';
import { builtinModules } from 'module';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';

export default defineConfig({
    plugins: [
        electron([
            {
                entry: 'electron/main.ts', // ESM으로 번들됨
                vite: {
                    build: {
                        outDir: 'dist-electron/main',
                    },
                },
            },
            {
                vite: {
                    build: {
                        outDir: 'dist-electron/preload',
                        lib: {
                            entry: 'electron/preload.ts',
                            formats: ['cjs'], // ⭐️ CJS로만 번들링
                            fileName: () => 'preload.js',
                        },
                        rollupOptions: {
                            external: [...builtinModules],
                        },
                        emptyOutDir: false,
                    },
                },
            },
        ]),
        react(),
    ],
    resolve: {
        alias: [{ find: '@', replacement: '/src' }],
    },
});
