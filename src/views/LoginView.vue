<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleLogin() {
	if (!email.value || !password.value) {
		error.value = 'Preencha todos os campos';
		return;
	}

	loading.value = true;
	error.value = '';

	try {
		await authStore.signIn(email.value, password.value);

		// Redirecionar para página original ou books
		const redirect = route.query.redirect || '/books';
		router.push(redirect);
	} catch (err) {
		error.value = err.message || 'Erro ao fazer login';
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<div class="login-view flex justify-center items-center">
		<div class="login-card">
			<h1>📚 Entrar</h1>

			<form @submit.prevent="handleLogin">
				<div class="form-group">
					<label for="email">Email:</label>
					<input
						class="primary-input"
						id="email"
						v-model="email"
						type="email"
						placeholder="seu@email.com"
						required
					/>
				</div>

				<div class="form-group">
					<label for="password">Senha:</label>
					<input
						class="primary-input"
						id="password"
						v-model="password"
						type="password"
						placeholder="••••••••"
						required
					/>
				</div>

				<div v-if="error" class="error">
					{{ error }}
				</div>

				<button type="submit" class="btn-primary" :disabled="loading">
					{{ loading ? 'Entrando...' : 'Entrar' }}
				</button>
			</form>

			<p class="register-link">
				Não tem conta?
				<router-link :to="{ name: 'register' }">Registre-se</router-link>
			</p>
		</div>
	</div>
</template>

<style scoped>
.login-view {
	min-height: 100vh;
}

.login-card {
	background: white;
	padding: 40px;
	border-radius: 12px;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	max-width: 400px;
	width: 100%;
}

h1 {
	text-align: center;
	margin-bottom: 30px;
	color: #333;
}

.form-group {
	margin-bottom: 20px;
}

.form-group label {
	display: block;
	margin-bottom: 8px;
	font-weight: 600;
	color: #555;
}

.error {
	background: #fee2e2;
	color: #dc2626;
	padding: 12px;
	border-radius: 8px;
	margin-bottom: 20px;
	text-align: center;
}

.register-link {
	text-align: center;
	margin-top: 20px;
	color: #666;
}

.register-link a {
	color: #667eea;
	text-decoration: none;
	font-weight: 600;
}

.register-link a:hover {
	text-decoration: underline;
}
</style>
