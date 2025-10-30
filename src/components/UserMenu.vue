<script setup>
import { ref } from 'vue';

import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

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
		await authStore.logout();
		closeMenu();
		router.push('/');
	} catch (error) {
		console.error('Logout failed:', error);
	}
}
</script>

<template>
	<div class="user-menu">
		<button @click="toggleMenu" class="btn-primary rounded-xl">
			<span>Bem vinda, {{ authStore.userEmail ? 'Camila ' : '' }}</span>
			<span>{{ isMenuOpen ? '▲' : '▼' }}</span>
		</button>
		<div v-if="isMenuOpen" class="dropdown">
			<router-link to="/profile" @click="closeMenu" class="menu-item">
				👤 Perfil
			</router-link>
			<router-link to="/settings" @click="closeMenu" class="menu-item">
				⚙️ Configurações
			</router-link>
			<hr class="divider" />
			<button @click="handleLogout" class="menu-item logout">🚪 Sair</button>
		</div>
	</div>
</template>

<style scoped>
.user-menu {
	position: relative;
}
.user-menu .btn-primary:hover:not(:disabled) {
	transform: translateY(0);
}
.user-button {
	background: white;
	border: 2px solid #e0e0e0;
	padding: 10px 16px;
	border-radius: 8px;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 10px;
	font-weight: 500;
	color: #333;
}

.user-button:hover {
	border-color: #667eea;
}

.dropdown {
	position: absolute;
	top: 100%;
	right: 0;
	margin-top: 8px;
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
}

.menu-item:hover {
	background: #f5f5f5;
}

.menu-item.logout {
	color: #e53e3e;
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
