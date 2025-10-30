<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const formData = reactive({
	email: '',
	password: '',
});

const formErrors = reactive({
	email: '',
	password: '',
});

const showPassword = ref(false);

function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function validateForm() {
	let isValid = true;

	formErrors.email = '';
	formErrors.password = '';

	if (!formData.email) {
		formErrors.email = 'E-mail is required.';
		isValid = false;
	} else if (!validateEmail(formData.email)) {
		formErrors.email = 'Invalid email format.';
	}

	if (!formData.password) {
		formErrors.password = 'Password is required.';
		isValid = false;
	} else if (formData.password.length < 4) {
		formErrors.password = 'Password must be at least 4 characters.';
		isValid = false;
	}

	return isValid;
}

async function handleSubmit() {
	if (!validateForm()) return;
	try {
		await authStore.login(formData.email, formData.password);
		router.push('/list');
	} catch (error) {
		console.error('Login failed:', error);
	}
}
</script>

<template>
	<div class="login-container">
		<div class="login-card">
			<div class="login-header">
				<h1>📚 My Library</h1>
				<p>Faça login para acessar sua biblioteca</p>
			</div>

			<form @submit.prevent="handleSubmit" class="login-form">
				<div class="form-group">
					<label for="email">Email</label>
					<input
						id="email"
						v-model="formData.email"
						type="email"
						placeholder="seu@email.com"
						:class="{ 'input-error': formErrors.email }"
						@input="formErrors.email = ''"
					/>
					<span v-if="formErrors.email" class="error-message">
						{{ formErrors.email }}
					</span>
				</div>

				<div class="form-group">
					<label for="password">Senha</label>
					<div class="password-input">
						<input
							id="password"
							v-model="formData.password"
							:type="showPassword ? 'text' : 'password'"
							placeholder="****"
							:class="{ 'input-error': formErrors.password }"
							@input="formErrors.password = ''"
						/>
						<button
							type="button"
							class="toggle-password"
							@click="showPassword = !showPassword"
						>
							{{ showPassword ? '🙈' : '👁️' }}
						</button>
					</div>
					<span v-if="formErrors.password" class="error-message">
						{{ formErrors.password }}
					</span>
				</div>

				<div v-if="authStore.error" class="alert alert-error">
					{{ authStore.error }}
					<button type="button" @click="authStore.clearError" class="close-btn">
						×
					</button>
				</div>

				<button type="submit" class="btn-primary btn-primary" :disabled="authStore.loading">
					<span v-if="authStore.loading">Entrando...</span>
					<span v-else>Entrar</span>
				</button>

				<!-- <p class="register-link">
					Não tem uma conta?
					<router-link to="/register">Cadastre-se</router-link>
				</p> -->
			</form>
		</div>
	</div>
</template>

<style scoped>
.login-container {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.login-card {
	background: white;
	border-radius: 16px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	width: 100%;
	max-width: 400px;
	padding: 40px;
}

.login-header {
	text-align: center;
	margin-bottom: 30px;
}

.login-header h1 {
	margin: 0 0 10px 0;
	color: #333;
	font-size: 32px;
}

.login-header p {
	margin: 0;
	color: #666;
	font-size: 14px;
}

.login-form {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.form-group {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.form-group label {
	font-weight: 600;
	color: #333;
	font-size: 14px;
}

.form-group input {
	padding: 12px 16px;
	border: 2px solid #e0e0e0;
	border-radius: var(--border-radius);
	font-size: 16px;
	transition: all 0.3s;
  color: #333;
}

.form-group input:focus {
	outline: none;
	border-color: var(--accent3);
	box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.input-error {
	border-color: var(--error-color);
}

.password-input {
	position: relative;
	display: flex;
	align-items: center;
}

.password-input input {
	flex: 1;
	padding-right: 50px;
}

.toggle-password {
	position: absolute;
	right: 12px;
	background: none;
	border: none;
	cursor: pointer;
	font-size: 18px;
	padding: 4px 8px;
}

.error-message {
	color: var(--error-color);
	font-size: 12px;
	font-weight: 500;
}

.alert {
	padding: 12px 16px;
	border-radius: var(--border-radius);
	font-size: 14px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.alert-error {
	background: #fee;
	color: var(--error-color);
	border: 1px solid #fcc;
}

.close-btn {
	background: none;
	border: none;
	font-size: 24px;
	cursor: pointer;
	color: var(--error-color);
	padding: 0;
	line-height: 1;
}


.btn-primary:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.register-link {
	text-align: center;
	color: #666;
	font-size: 14px;
	margin-top: 10px;
}

.register-link a {
	color: #667eea;
	font-weight: 600;
	text-decoration: none;
}


@media (max-width: 480px) {
	.login-card {
		padding: 30px 20px;
	}

	.login-header h1 {
		font-size: 24px;
	}
}
</style>
