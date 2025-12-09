
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement depuis le dossier courant
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Injecte la clé API de manière sécurisée lors du build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    }
  }
})