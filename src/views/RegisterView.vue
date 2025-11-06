<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

async function handleRegister() {
	error.value = '';

	if (!name.value || !email.value || !password.value) {
		error.value = 'Preencha todos os campos';
		return;
	}

	if (password.value !== confirmPassword.value) {
		error.value = 'As senhas não coincidem';
		return;
	}

	if (password.value.length < 6) {
		error.value = 'A senha deve ter no mínimo 6 caracteres';
		return;
	}

	loading.value = true;

	try {
		await authStore.signUp(email.value, password.value, name.value);
		router.push('/books');
	} catch (err) {
		error.value = err.message || 'Erro ao registrar';
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<div class="register-view flex justify-center items-center">
		<div class="register-card">
			<h1>📚 Registrar</h1>

			<form @submit.prevent="handleRegister">
				<div class="form-group">
					<label for="name">Nome:</label>
					<input
						class="primary-input"
						id="name"
						v-model="name"
						type="text"
						placeholder="Seu nome"
						required
					/>
				</div>

				<div class="form-group">
					<label for="email">Email:</label>
					<input
						class="primary-input"
						id="email"
						v-model="email"
						type="email"
						placeholder="seu.melhor.email@email.com"
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
						placeholder="••••"
						required
					/>
				</div>

				<div class="form-group">
					<label for="confirmPassword">Confirmar Senha:</label>
					<input
						class="primary-input"
						id="confirmPassword"
						v-model="confirmPassword"
						type="password"
						placeholder="••••"
						required
					/>
				</div>

				<div v-if="error" class="error">
					{{ error }}
				</div>

				<button type="submit" class="btn-primary" :disabled="loading">
					{{ loading ? 'Registrando...' : 'Registrar' }}
				</button>
			</form>

			<p class="login-link">
				Já tem conta?
				<router-link :to="{ name: 'login' }">Entre aqui</router-link>
			</p>
		</div>
	</div>
</template>

<style scoped>
.register-view {
	min-height: 100vh;
}

.register-card {
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
  font-size: 1.5rem;
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

.login-link {
	text-align: center;
	margin-top: 20px;
	color: #666;
}

.login-link a {
	color: #667eea;
	text-decoration: none;
	font-weight: 600;
}

.login-link a:hover {
	text-decoration: underline;
}
</style>
