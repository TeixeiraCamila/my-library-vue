import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore';

const lazyLoad = (view) => {
	return () => import(`../views/${view}.vue`);
};

const router = new createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: lazyLoad('HomeView'),
		},
		{
			path: '/about',
			name: 'about',
			component: lazyLoad('AboutView'),
		},
		{
			path: '/list',
			name: 'lisy',
			component: lazyLoad('BooksListView'),
		},
	],
});

router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore();

	await authStore.checkSession();
	const requiresAuth = to.meta.requiresAuth;
	const isAuthenticated = authStore.isAuthenticated;

	if (requiresAuth && !isAuthenticated) {
		next({ name: 'home' });
	} else if (to.name === 'home' && isAuthenticated) {
		next({ name: 'books' });
	} else {
		next();
	}
});
export default router;
