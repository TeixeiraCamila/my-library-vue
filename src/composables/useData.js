export const useDate = () => {
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  }
  
  return { formatDate }
}

