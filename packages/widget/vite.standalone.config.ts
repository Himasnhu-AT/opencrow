import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Standalone bundle that includes React (for script tag usage)
export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/standalone.ts'),
            name: 'AIAgentWidget',
            fileName: 'ai-agent-widget',
            formats: ['umd']
        },
        rollupOptions: {
            // Bundle React for standalone use
            external: [],
            output: {
                globals: {}
            }
        },
        outDir: 'dist/standalone'
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production')
    }
});
