import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const lazyLoad = (view) => {
	return () => import(`../views/${view}.vue`);
};

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: lazyLoad('LoginView'),
			meta: { requiresGuest: true },
		},
		{
			path: '/about',
			name: 'about',
			component: lazyLoad('AboutView'),
		},
		{
			path: '/login',
			name: 'login',
			component: lazyLoad('LoginView'),
			meta: { requiresGuest: true },
		},
		{
			path: '/register',
			name: 'register',
			component: lazyLoad('RegisterView'),
			meta: { requiresGuest: true },
		},
		{
			path: '/graphics',
			name: 'graphics',
			component: lazyLoad('GraphicsView'),
			meta: { requiresAuth: true },
		},
		{
			path: '/books',
			name: 'books',
			component: lazyLoad('BooksListView'),
			meta: { requiresAuth: true },
		},
		{
			path: '/list',
			name: 'list',
			component: lazyLoad('BooksListView'),
			meta: { requiresAuth: true },
		},
		{
			path: '/admin',
			name: 'admin',
			component: lazyLoad('AdminView'),
			meta: {
				requiresAuth: true,
				requiresAdmin: true,
			},
		},
		{
			path: '/seed',
			name: 'seed',
			component: lazyLoad('SeedView'),
			meta: { onlyDevelopment: true },
		},
		{
			path: '/unauthorized',
			name: 'unauthorized',
			component: lazyLoad('UnauthorizedView'),
		},
		{
			path: '/:pathMatch(.*)*',
			name: 'not-found',
			component: lazyLoad('NotFoundView'),
		},
	],
});

router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore();

	// 🔧 CORRIGIDO: Aguardar inicialização completa antes de verificar auth
	if (!authStore.initialized) {
		console.log('⏳ Aguardando inicialização do auth...');
		await authStore.initialize();
	}

	const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
	const requiresGuest = to.matched.some((record) => record.meta.requiresGuest);
	const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
	const onlyDevelopment = to.matched.some(
		(record) => record.meta.onlyDevelopment
	);

	// Bloquear rota de seed em produção
	if (onlyDevelopment && import.meta.env.PROD) {
		console.warn('🚫 Rota /seed bloqueada em produção');
		next({ name: 'home' });
		return;
	}

	// Se requer autenticação e não está autenticado
	if (!authStore.isAuthenticated && requiresAuth) {
		console.log('🔒 Acesso negado: usuário não autenticado');
		next({ name: 'login', query: { redirect: to.fullPath } });
		return;
	}

	// Se requer guest (login/register) e está autenticado
	if (authStore.isAuthenticated && requiresGuest) {
		console.log('✅ Usuário já autenticado, redirecionando para books');
		next({ name: 'books' });
		return;
	}

	// Se requer admin e não é admin
	if (requiresAdmin && !authStore.isAdmin) {
		console.log('🚫 Acesso negado: requer permissão de admin');
		next({ name: 'unauthorized' });
		return;
	}

	// Permitir navegação
	next();
});

// Log de navegação em desenvolvimento
if (import.meta.env.DEV) {
	router.afterEach((to) => {
		console.log(`📍 Navegou para: ${to.name || to.path}`);
	});
}

export default router;
