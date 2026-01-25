import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'AIAgentWidget',
            fileName: 'ai-agent-widget',
            formats: ['umd']
        },
        rollupOptions: {
            // Don't externalize React - bundle it for standalone use
            external: [],
            output: {
                globals: {}
            }
        }
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production')
    }
});

