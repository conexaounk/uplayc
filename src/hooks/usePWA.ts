import { useEffect } from 'react';

export const usePWA = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('Service Worker registrado com sucesso:', registration);
          })
          .catch((error) => {
            console.log('Falha ao registrar Service Worker:', error);
          });
      });
    }
  }, []);
};
