<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();
const isMenuOpen = ref(false);

function toggleMenu() {
	isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
	isMenuOpen.value = false;
}

async function handleLogout() {
	try {
		closeMenu();
		await authStore.signOut();
		router.push('/login');
	} catch (error) {
		console.error('❌ ERRO no logout:', error);
	}
}
</script>

<template>
	<div class="user-menu">
		<button @click="toggleMenu" class="btn-primary rounded-xl" type="button">
			<span class="hidden md:flex">
				Bem vinda,
				{{ authStore.userProfile?.name || authStore.user?.email || 'Usuário' }}
			</span>
			<span class="hidden md:flex">{{ isMenuOpen ? '▲' : '▼' }}</span>
			<span class="flex md:hidden">👤</span>
		</button>

		<div v-if="isMenuOpen" class="dropdown">
			<button @click="handleLogout" class="menu-item logout" type="button">
				🚪 Sair
			</button>
		</div>
	</div>
</template>

<style scoped>
.user-menu {
	position: relative;
}

.user-menu .btn-primary {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 16px;
}

.user-menu .btn-primary:hover:not(:disabled) {
	transform: translateY(0);
}

.dropdown {
	position: absolute;
	top: calc(100% + 8px);
	right: 0;
	background: white;
	border-radius: 8px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	min-width: 200px;
	z-index: 100;
	overflow: hidden;
}

.menu-item {
	display: block;
	width: 100%;
	padding: 12px 16px;
	border: none;
	background: none;
	text-align: left;
	cursor: pointer;
	color: #333;
	text-decoration: none;
	transition: background 0.2s;
	font-size: 14px;
}

.menu-item:hover {
	background: #f5f5f5;
}

.menu-item.logout {
	color: #e53e3e;
	font-weight: 500;
}

.menu-item.logout:hover {
	background: #fee;
}

.divider {
	border: none;
	border-top: 1px solid #e0e0e0;
	margin: 4px 0;
}
</style>
