import '@/app/ui/styles/style.css';
import 'primeicons/primeicons.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from '@/App.vue';
import router from '@/app/router';
// import VueScan from 'z-vue-scan';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';

import { definePreset } from '@primevue/themes';

// Переопределяем PrimeVue primary цвет
const MyPreset = definePreset(Aura, {
	semantic: {
		primary: {
			50: '{slate.50}',
			100: '{slate.100}',
			200: '{slate.200}',
			300: '{slate.300}',
			400: '{slate.400}',
			500: '{slate.500}',
			600: '{slate.600}',
			700: '{slate.700}',
			800: '{slate.800}',
			900: '{slate.900}',
			950: '{slate.950}'
		}
	}
});

const app = createApp(App);

app.directive('tooltip', Tooltip);

app
	.use(createPinia())
	.use(router)
	.use(PrimeVue, {
		theme: {
			preset: MyPreset
		},
		ripple: true
	})
	// .use(VueScan, {}) // Использовать для дебага компонентов
	.use(ToastService)
	.use(ConfirmationService);

app.mount('#app');
