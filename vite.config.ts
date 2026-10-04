import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const ollamaApiKey = env.OLLAMA_API_KEY || env.VITE_OLLAMA_API_KEY || '';
  const ollamaHost = env.OLLAMA_HOST || 'https://ollama.com';

  const ollamaProxyConfig = {
    target: ollamaHost,
    changeOrigin: true,
    timeout: 300000,
    rewrite: (path: string) => path.replace(/^\/api\/ollama/, ''),
    headers: {
      Authorization: `Bearer ${ollamaApiKey}`
    },
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any) => {
        proxyReq.setHeader('Authorization', `Bearer ${ollamaApiKey}`);
      });
    }
  };

  const n8nProxyConfig = {
    target: 'http://localhost:5678',
    changeOrigin: true
  };

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      open: true,
      proxy: {
        '/api/ollama': ollamaProxyConfig,
        '/webhook/research-workspace': n8nProxyConfig,
        '/api/n8n': {
          ...n8nProxyConfig,
          rewrite: (path: string) => path.replace(/^\/api\/n8n/, '')
        }
      }
    },
    preview: {
      port: 3000,
      proxy: {
        '/api/ollama': ollamaProxyConfig,
        '/webhook/research-workspace': n8nProxyConfig,
        '/api/n8n': {
          ...n8nProxyConfig,
          rewrite: (path: string) => path.replace(/^\/api\/n8n/, '')
        }
      }
    }
  };
});

