import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const userProfile = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const initialized = ref(false); 

  // Computed
  const isAuthenticated = computed(() => !!user.value);
  const userRole = computed(() => userProfile.value?.role_name || 'viewer');
  const roleId = computed(() => userProfile.value?.role_id || 3);
  
  // Permissões
  const canCreate = computed(() => ['admin', 'editor'].includes(userRole.value));
  const canEdit = computed(() => ['admin', 'editor'].includes(userRole.value));
  const canDelete = computed(() => userRole.value === 'admin');
  const isAdmin = computed(() => userRole.value === 'admin');
  const isEditor = computed(() => userRole.value === 'editor');
  const isViewer = computed(() => userRole.value === 'viewer');

  // Actions
  async function fetchUserProfile() {
    if (!user.value) return;

    try {
      const { data, error: profileError } = await supabase
        .from('users_with_roles')
        .select('*')
        .eq('auth_id', user.value.id)
        .single();

      if (profileError) throw profileError;

      userProfile.value = data;
      console.log('👤 Perfil do usuário:', userProfile.value);
    } catch (err) {
      console.error('❌ Erro ao buscar perfil:', err);
      error.value = err.message;
    }
  }

  async function signUp(email, password, name) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (signUpError) throw signUpError;

      user.value = data.user;
      console.log('✅ Usuário registrado:', user.value);
      
      // Aguardar criação do perfil via trigger
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchUserProfile();

      return data;
    } catch (err) {
      error.value = err.message;
      console.error('❌ Erro no registro:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function signIn(email, password) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      user.value = data.user;
      await fetchUserProfile();

      console.log('✅ Login realizado:', user.value);
      return data;
    } catch (err) {
      error.value = err.message;
      console.error('❌ Erro no login:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function signOut() {
    loading.value = true;
    error.value = null;

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      user.value = null;
      userProfile.value = null;
      console.log('✅ Logout realizado');
    } catch (err) {
      error.value = err.message;
      console.error('❌ Erro no logout:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function initialize() {
    // 👈 CORRIGIDO: Evitar múltiplas inicializações
    if (initialized.value) {
      console.log('⏭️  Auth já inicializado, pulando...');
      return;
    }
    
    loading.value = true;
    console.log('🔄 Inicializando autenticação...');

    try {
      // Verificar sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        user.value = session.user;
        await fetchUserProfile();
        console.log('✅ Sessão restaurada:', user.value.email);
      } else {
        console.log('ℹ️  Nenhuma sessão ativa');
      }

      // Observar mudanças de autenticação
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (session?.user) {
          user.value = session.user;
          await fetchUserProfile();
        } else {
          user.value = null;
          userProfile.value = null;
        }
      });
    } catch (err) {
      console.error('❌ Erro ao inicializar auth:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
      initialized.value = true; // 👈 ADICIONADO: Marcar como inicializado
      console.log('✅ Autenticação inicializada');
    }
  }

  // Admin functions
  async function getAllUsers() {
    if (!isAdmin.value) {
      throw new Error('Sem permissão para listar usuários');
    }

    const { data, error: usersError } = await supabase
      .from('users_with_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;
    return data;
  }

  async function updateUserRole(userId, newRoleId) {
    if (!isAdmin.value) {
      throw new Error('Sem permissão para alterar roles');
    }

    const { data, error: updateError } = await supabase
      .from('users')
      .update({ role_id: newRoleId, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data;
  }

  async function toggleUserActive(userId, active) {
    if (!isAdmin.value) {
      throw new Error('Sem permissão para ativar/desativar usuários');
    }

    const { data, error: updateError } = await supabase
      .from('users')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data;
  }

  return {
    // State
    user,
    userProfile,
    loading,
    error,
    initialized, 

    // Computed
    isAuthenticated,
    userRole,
    roleId,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    isEditor,
    isViewer,

    // Actions
    signUp,
    signIn,
    signOut,
    initialize,
    fetchUserProfile,
    getAllUsers,
    updateUserRole,
    toggleUserActive,
  };
});