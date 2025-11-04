<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const users = ref([]);
const roles = ref([
  { id: 1, name: 'admin' },
  { id: 2, name: 'editor' },
  { id: 3, name: 'viewer' }
]);

onMounted(async () => {
  await loadUsers();
});

async function loadUsers() {
  try {
    users.value = await authStore.getAllUsers();
  } catch (error) {
    alert(error.message);
  }
}

async function changeRole(userId, newRoleId) {
  try {
    await authStore.updateUserRole(userId, newRoleId);
    await loadUsers();
    alert('Role atualizada com sucesso!');
  } catch (error) {
    alert(error.message);
  }
}

async function toggleActive(user) {
  try {
    await authStore.toggleUserActive(user.id, !user.active);
    await loadUsers();
  } catch (error) {
    alert(error.message);
  }
}
</script>

<template>
  <div class="admin-view">
    <h1>Gerenciar Usuários</h1>

    <table class="users-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Criado em</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <select 
              :value="user.role_id" 
              @change="changeRole(user.id, $event.target.value)"
            >
              <option 
                v-for="role in roles" 
                :key="role.id" 
                :value="role.id"
              >
                {{ role.name }}
              </option>
            </select>
          </td>
          <td>
            <span :class="user.active ? 'status-active' : 'status-inactive'">
              {{ user.active ? 'Ativo' : 'Inativo' }}
            </span>
          </td>
          <td>{{ new Date(user.created_at).toLocaleDateString('pt-BR') }}</td>
          <td>
            <button @click="toggleActive(user)">
              {{ user.active ? 'Desativar' : 'Ativar' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.status-active {
  color: #22c55e;
  font-weight: bold;
}

.status-inactive {
  color: #ef4444;
  font-weight: bold;
}
</style>