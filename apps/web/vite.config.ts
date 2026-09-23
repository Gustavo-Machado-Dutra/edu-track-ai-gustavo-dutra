import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  let env: Record<string, string> = {};
  if (mode !== 'test') {
    const root = resolve(__dirname, '..', '..');
    env = loadEnv(mode, root, '');
  }
  const apiPort = env.API_PORT || '3333';

  return {
    plugins: [react()],
    server: {
      port: Number(env.WEB_PORT || 5173),
      proxy: {
        '/api': {
          target: 'http://localhost:' + apiPort,
          changeOrigin: true,
        },
      },
    },
  };
});
