// composables/useModal.js
import { ref } from 'vue';

// Estados criados FORA da função - compartilhados entre todas as chamadas
const isOpen = ref(false);
const mode = ref('add');
const editingBook = ref(null);

export const useModal = () => {
  const openForAdd = () => {
    mode.value = 'add';
    editingBook.value = null;
    isOpen.value = true;
  };

  const openForEdit = (book) => {
    mode.value = 'edit';
    editingBook.value = { ...book };
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
    mode.value = 'add';
    editingBook.value = null;
  };

  return {
    isOpen,
    mode,
    editingBook,
    openForAdd,
    openForEdit,
    close,
  };
};