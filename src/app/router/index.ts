import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
	{
		path: '/',
		name: 'main',
		component: () => import('@/pages/Main.vue')
	},
	{
		path: '/:catchAll(.*)',
		redirect: '/'
	}
];

const router = createRouter({
	routes,
	history: createWebHashHistory(),
	linkExactActiveClass: 'bg-tertiary border-violet-800'
});

export default router;
