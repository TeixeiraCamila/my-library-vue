// Authentication 

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';


export const useAuthStore = defineStore('auth', () => {
	// State
	const user = ref(null);
	const loading = ref(false);
	const error = ref(null);
	const session = ref(null);

	// Getters
	const isAuthenticated = computed(() => !!user.value);
	const userEmail = computed(() => user.value?.email || '');

	// Actions
	async function login(email, password) {
		loading.value = true;
		error.value = null;

		try {
			const { data, error: authError } = await supabase.auth.signInWithPassword(
				{
					email,
					password,
				}
			);

			if (authError) throw authError;

			user.value = data.user;
			session.value = data.session;
			console.log('✅ Login bem-sucedido:', user.value);
			return data;
		} catch (error) {
			error.value = error.message;
			console.error('❌ Erro ao fazer login:', error);
			throw error;
		} finally {
			loading.value = false;
		}
	}

	async function logout() {
		loading.value = true;
		error.value = null;
		try {
			const { error: authError } = await supabase.auth.signOut();
			if (authError) throw authError;

			user.value = null;
			session.value = null;
			console.log('✅ Logout bem-sucedido');
		} catch (error) {
			error.value = error.message;
			console.error('❌ Erro ao fazer logout:', error);
			throw error;
		} finally {
			loading.value = false;
		}
	}

	async function checkSession() {
		const {
			data: { session: currentSession },
		} = await supabase.auth.getSession();
		if (currentSession) {
			session.value = currentSession;
			user.value = currentSession.user;
		}
	}

	// mudança de estado de autenticação
	supabase.auth.onAuthStateChange((_event, currentSession) => {
		session.value = currentSession;
		user.value = currentSession?.user || null;
	});

	function clearError() {
		error.value = null;
	}
	return {
		user,
		loading,
		error,
		session,
		isAuthenticated,
		userEmail,
		login,
		logout,
		checkSession,
		clearError,
	};
});
