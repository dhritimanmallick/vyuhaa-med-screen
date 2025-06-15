
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      // Reduce file watching overhead
      usePolling: false,
      interval: 300,
      binaryInterval: 1000,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.vscode/**',
        '**/.idea/**',
        '**/coverage/**',
        '**/*.log',
        '**/tmp/**',
        '**/temp/**'
      ]
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize dependencies to reduce file watching
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react'
    ],
  },
  // Reduce the number of files being processed
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
}));
