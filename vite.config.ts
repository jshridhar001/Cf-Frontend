import path from 'node:path';
import { fileURLToPath } from 'node:url';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    chunkSizeWarningLimit: 1300,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
            },
            {
              // Keep tslib out of pdf-vendor so Radix/UI does not load the PDF stack on every page.
              name: 'tslib',
              test: /[\\/]node_modules[\\/]tslib[\\/]/,
              priority: 45,
            },
            {
              // Keep @react-pdf's CJS graph (unicode-properties + base64-js) in one chunk.
              // Splitting it with vendor maxSize caused "i is not a function" in production.
              name: 'pdf-vendor',
              test: /[\\/]node_modules[\\/](@react-pdf|pdfkit|fontkit|unicode-properties|unicode-trie|restructure|tiny-inflate|base64-js|queue|linebreak|brotli|pako|clone|dfa|jpeg-exif|png-js|svg-arc-to-cubic-bezier)[\\/]/,
              priority: 38,
            },
            {
              name: 'chart-vendor',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              priority: 35,
            },
            {
              name: 'zod-vendor',
              test: /[\\/]node_modules[\\/]zod[\\/]/,
              priority: 35,
            },
            {
              name: 'tanstack-vendor',
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
              priority: 30,
            },
            {
              name: 'ui-vendor',
              test: /[\\/]node_modules[\\/](@radix-ui|radix-ui|lucide-react|@base-ui|sonner)[\\/]/,
              priority: 25,
            },
            {
              name: 'date-vendor',
              test: /[\\/]node_modules[\\/]date-fns[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 0,
              maxSize: 400_000,
            },
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
