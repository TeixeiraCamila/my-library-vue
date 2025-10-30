import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
// https://vite.dev/config/

export default defineConfig({
	plugins: [vue(), tailwindcss()],
	define: {
		__VUE_OPTIONS_API__: true,
		__VUE_PROD_DEVTOOLS__: false, // ou true se quiser devtools em produção
	},
});
