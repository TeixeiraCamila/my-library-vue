# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).



// apagar depois
// ============================================
// 📦 INSTALAÇÃO
// ============================================
// npm install pinia

// ============================================
// 📁 ESTRUTURA DO PROJETO
// ============================================
/*
src/
├── main.js
├── App.vue
├── lib/
│   └── supabaseClient.js
└── stores/
    └── booksStore.js
*/

// ============================================
// 📄 src/main.js
// ============================================
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#app');

// ============================================
// 📄 src/lib/supabaseClient.js
// ============================================
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// 📄 src/stores/booksStore.js
// ============================================
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';

export const useBooksStore = defineStore('books', () => {
  // State
  const books = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters (computed)
  const booksCount = computed(() => books.value.length);
  
  const booksByCategory = computed(() => {
    return books.value.reduce((acc, book) => {
      const category = book.category || 'Sem categoria';
      if (!acc[category]) acc[category] = [];
      acc[category].push(book);
      return acc;
    }, {});
  });

  const booksByAuthor = computed(() => {
    return books.value.reduce((acc, book) => {
      const author = book.author || 'Autor desconhecido';
      if (!acc[author]) acc[author] = [];
      acc[author].push(book);
      return acc;
    }, {});
  });

  // Actions
  async function fetchBooks() {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('my-books')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      books.value = data || [];
      console.log('✅ Livros carregados:', books.value);
      
    } catch (err) {
      error.value = err.message;
      console.error('❌ Erro ao carregar livros:', err);
    } finally {
      loading.value = false;
    }
  }

  async function addBook(newBook) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('my-books')
        .insert([newBook])
        .select();

      if (supabaseError) throw supabaseError;

      books.value.unshift(data[0]);
      console.log('✅ Livro adicionado:', data[0]);
      
      return data[0];
    } catch (err) {
      error.value = err.message;
      console.error('❌ Erro ao adicionar livro:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateBook(id, updates) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('my-books')
        .update(updates)
        .eq('id', id)
        .select();

      if (supabaseError) throw supabaseError;

      const index = books.value.findIndex(book => book.id === id);
      if (index !== -1) {
        books.value[index] = data[0];
      }
      
      console.log('✅ Livro atualizado:', data[0]);
      return data[0];
    } catch (err) {
      error.value = err.message;
      console.error('❌ Erro ao atualizar livro:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteBook(id) {
    loading.value = true;
    error.value = null;

    try {
      const { error: supabaseError } = await supabase
        .from('my-books')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      books.value = books.value.filter(book => book.id !== id);
      console.log('✅ Livro deletado:', id);
      
    } catch (err) {
      error.value = err.message;
      console.error('❌ Erro ao deletar livro:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function getBookById(id) {
    return books.value.find(book => book.id === id);
  }

  function searchBooks(query) {
    const lowerQuery = query.toLowerCase();
    return books.value.filter(book => 
      book.title?.toLowerCase().includes(lowerQuery) ||
      book.author?.toLowerCase().includes(lowerQuery) ||
      book.category?.toLowerCase().includes(lowerQuery)
    );
  }

  function clearError() {
    error.value = null;
  }

  // Retornar tudo que será exposto
  return {
    // State
    books,
    loading,
    error,
    
    // Getters
    booksCount,
    booksByCategory,
    booksByAuthor,
    
    // Actions
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    getBookById,
    searchBooks,
    clearError
  };
});

// ============================================
// 📄 src/App.vue (USANDO A STORE)
// ============================================
/*
<script setup>
import { onMounted } from 'vue';
import { useBooksStore } from './stores/booksStore';

const booksStore = useBooksStore();

onMounted(() => {
  booksStore.fetchBooks();
});
</script>

<template>
  <div class="app">
    <h1>Minha Biblioteca</h1>
    
    <!-- Loading -->
    <div v-if="booksStore.loading" class="loading">
      Carregando...
    </div>
    
    <!-- Error -->
    <div v-if="booksStore.error" class="error">
      {{ booksStore.error }}
      <button @click="booksStore.clearError">Fechar</button>
    </div>
    
    <!-- Contador -->
    <p>Total de livros: {{ booksStore.booksCount }}</p>
    
    <!-- Lista de livros -->
    <div v-if="!booksStore.loading && booksStore.books.length > 0">
      <div v-for="book in booksStore.books" :key="book.id" class="book-card">
        <h2>{{ book.title }}</h2>
        <p>{{ book.author }}</p>
        <button @click="booksStore.deleteBook(book.id)">Deletar</button>
      </div>
    </div>
    
    <!-- Vazio -->
    <div v-else-if="!booksStore.loading">
      Nenhum livro encontrado
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #667eea;
}

.error {
  background: #fee;
  border: 2px solid #c00;
  padding: 15px;
  border-radius: 8px;
  color: #c00;
  margin: 20px 0;
}

.book-card {
  background: #f5f7fa;
  padding: 20px;
  margin: 10px 0;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.book-card h2 {
  margin: 0 0 10px 0;
}

.book-card button {
  background: #c00;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.book-card button:hover {
  background: #900;
}
</style>
*/

// ============================================
// 📄 EXEMPLO: Componente que adiciona livro
// ============================================
/*
<script setup>
import { ref } from 'vue';
import { useBooksStore } from '../stores/booksStore';

const booksStore = useBooksStore();

const newBook = ref({
  title: '',
  author: '',
  isbn: '',
  pages: null,
  category: '',
  description: ''
});

async function handleSubmit() {
  try {
    await booksStore.addBook(newBook.value);
    
    // Limpar formulário
    newBook.value = {
      title: '',
      author: '',
      isbn: '',
      pages: null,
      category: '',
      description: ''
    };
    
    alert('Livro adicionado com sucesso!');
  } catch (error) {
    alert('Erro ao adicionar livro');
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="newBook.title" placeholder="Título" required />
    <input v-model="newBook.author" placeholder="Autor" />
    <button type="submit" :disabled="booksStore.loading">
      Adicionar Livro
    </button>
  </form>
</template>
*/

// ============================================
// 📄 .env (não commitar!)
// ============================================
/*
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua-chave-publica-anon
*/