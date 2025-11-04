# 📚 My Library

Sistema de gerenciamento de biblioteca pessoal desenvolvido com Vue 3, Vite e Pinia.

## 🚀 Tecnologias

- **Vue 3** - Framework JavaScript progressivo
- **Vite** - Build tool rápido
- **Pinia** - Gerenciamento de estado
- **Supabase** - Backend (PostgreSQL + Auth + Storage)
- **Tailwind CSS** - Estilização

## 📁 Estrutura do Projeto
```
my-library-vue/
├── public/              # Arquivos estáticos
├── src/
│   ├── assets/         # Imagens, SVGs, etc
│   ├── components/     # Componentes reutilizáveis
│   ├── composables/    # Composables do Vue
│   ├── lib/            # Bibliotecas e configurações
│   │   └── supabaseClient.js
│   ├── router/         # Rotas da aplicação
│   ├── stores/         # Stores do Pinia
│   │   ├── authStore.js
│   │   └── bookStore.js
│   ├── styles/         # Estilos globais
│   ├── views/          # Páginas/Views
│   ├── App.vue         # Componente raiz
│   └── main.js         # Ponto de entrada
├── .env.local          # Variáveis de ambiente
├── index.html
├── package.json
└── vite.config.js
```

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd my-library-vue
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Adicione suas credenciais do Supabase no `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Execute o projeto:
```bash
npm run dev
```

## 📊 Funcionalidades

### ✅ CRUD Completo
- **Create** - Adicionar novos livros
- **Read** - Listar e visualizar livros
- **Update** - Editar informações dos livros
- **Delete** - Remover livros da biblioteca

### 📖 Recursos
- Busca por título, autor, ISBN
- Filtros por estante e status de leitura
- Múltiplas estantes por livro
- Avaliações (0-5 estrelas)
- Status de leitura (Want to Read, Currently Reading, Read, Abandonado)
- Datas de início e término de leitura
- Contagem de releituras
- Notas privadas e reviews
- Paginação

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

**all-all-my-books**
- Informações completas dos livros
- Rating (0-5)
- Reading status
- Datas de leitura

**bookshelves**
- Estantes personalizadas

**book_shelves**
- Relacionamento N:N entre livros e estantes

**reading_status**
- Status de leitura disponíveis

## 📝 Scripts Disponíveis
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Lint do código
```

## 🎨 Componentes Principais

- **BookCard** - Card de exibição de livro
- **BookForm** - Formulário de adicionar/editar
- **Modal** - Modal reutilizável
- **SearchBar** - Barra de busca
- **Pagination** - Componente de paginação

## 🔐 Autenticação

Sistema de autenticação via Supabase com:
- Login/Registro
- Proteção de rotas
- Sessão persistente

## 📦 Dependências Principais
```json
{
  "vue": "^3.x",
  "vite": "^5.x",
  "pinia": "^2.x",
  "@supabase/supabase-js": "^2.x",
  "vue-router": "^4.x"
}
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT

## 👤 Autor

Seu Nome - [@seu_usuario](https://github.com/seu_usuario)

---

⭐ Feito com Vue 3 + Vite + Pinia