import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// Custom plugin to ensure _redirects file is copied
const copyRedirectsPlugin = () => ({
  name: 'copy-redirects',
  writeBundle() {
    // Ensure _redirects file exists in dist
    const redirectsContent = '/*    /index.html   200';
    fs.writeFileSync('dist/_redirects', redirectsContent);
    console.log('✅ _redirects file copied to dist folder');
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    copyRedirectsPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
}));
