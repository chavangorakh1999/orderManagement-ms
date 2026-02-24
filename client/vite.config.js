import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          // Vite registers its OWN error handlers AFTER configure() returns, so
          // we defer with setTimeout(0) to intercept and wrap them all.
          setTimeout(() => {
            const SUPPRESS = new Set(['EPIPE', 'ECONNRESET', 'ECONNREFUSED']);
            const isHarmless = (err) => {
              const code = err?.code ?? err?.errors?.[0]?.code;
              return SUPPRESS.has(code);
            };
            const wrapProxyEvent = (event) => {
              const listeners = proxy.rawListeners(event);
              if (!listeners.length) return;
              proxy.removeAllListeners(event);
              proxy.on(event, (err, ...rest) => {
                if (!isHarmless(err)) listeners.forEach((fn) => fn.call(proxy, err, ...rest));
              });
            };

            // Proxy-level error events
            for (const ev of ['error', 'proxyError', 'proxyReqWsError']) wrapProxyEvent(ev);

            // Per-socket errors: Vite attaches socket.on('error') inside proxyReqWs.
            // We run Vite's proxyReqWs handlers first (so they attach their socket
            // listener), then wrap that socket listener to filter harmless errors.
            const wsListeners = proxy.rawListeners('proxyReqWs');
            if (wsListeners.length) {
              proxy.removeAllListeners('proxyReqWs');
              proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
                wsListeners.forEach((fn) => fn.call(proxy, proxyReq, req, socket, options, head));
                const sockListeners = socket.rawListeners('error');
                socket.removeAllListeners('error');
                socket.on('error', (err) => {
                  if (!isHarmless(err)) sockListeners.forEach((fn) => fn.call(socket, err));
                });
              });
            }
          }, 0);
        },
      },
    },
  },
});
