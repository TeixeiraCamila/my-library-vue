<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome() {
  router.push('/');
}
</script>

<template>
  <div class="not-found-view">
    <div class="content">
      <div class="icon">📚</div>
      <h1>404</h1>
      <h2>Página Não Encontrada</h2>
      <p>Esta página não existe ou foi removida.</p>

      <button @click="goHome" class="btn-primary">
        🏠 Voltar para Início
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  text-align: center;
  color: white;
}

.icon {
  font-size: 100px;
  margin-bottom: 20px;
}

h1 {
  font-size: 120px;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 32px;
  margin: 10px 0;
}

p {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.btn-primary {
  padding: 14px 28px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn-primary:hover {
  transform: scale(1.05);
}
</style>