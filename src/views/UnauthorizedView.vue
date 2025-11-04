<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

function goBack() {
  router.back();
}

function goHome() {
  router.push('/books');
}
</script>

<template>
  <div class="unauthorized-view">
    <div class="content">
      <div class="icon">🚫</div>
      <h1>Acesso Negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      
      <div class="user-info">
        <p><strong>Usuário:</strong> {{ authStore.userProfile?.name }}</p>
        <p><strong>Permissão:</strong> {{ authStore.userRole }}</p>
      </div>

      <div class="actions">
        <button @click="goBack" class="btn-secondary">
          ← Voltar
        </button>
        <button @click="goHome" class="btn-primary">
          🏠 Ir para Início
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unauthorized-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px;
}

.content {
  background: white;
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  text-align: center;
  max-width: 500px;
}

.icon {
  font-size: 80px;
  margin-bottom: 20px;
}

h1 {
  color: #dc2626;
  margin-bottom: 10px;
}

p {
  color: #666;
  margin-bottom: 20px;
}

.user-info {
  background: #f3f4f6;
  padding: 20px;
  border-radius: 8px;
  margin: 30px 0;
}

.user-info p {
  margin: 5px 0;
  text-align: left;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #e5e7eb;
  color: #333;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary:hover {
  background: #d1d5db;
}
</style>