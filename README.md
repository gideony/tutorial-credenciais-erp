# Tutorial de Credenciais ERP - Azos Soft House

Este projeto é uma aplicação web moderna construída para fornecer instruções passo a passo (tutoriais) sobre como obter credenciais em diversos sistemas ERPs. O sistema conta com uma interface pública de visualização rápida e um **painel administrativo seguro** para gerenciar o conteúdo dinamicamente.

## 🚀 Funcionalidades

- **Interface Pública Dinâmica:** Visualização rápida e responsiva das instruções para cada ERP.
- **Painel Administrativo Seguro (`/admin`):** Um painel protegido por senha (Basic Auth) para gerenciar os tutoriais.
- **Editor de Texto Rico (WYSIWYG):** Criação e edição de tutoriais utilizando o `react-quill`, permitindo formatações avançadas (negrito, listas, etc).
- **Upload de Imagens Integrado:** É possível inserir imagens diretamente no meio do texto dos tutoriais (as imagens são salvas automaticamente no bucket do Supabase).
- **Segurança contra XSS:** O conteúdo HTML gerado pelo editor é sanitizado via `isomorphic-dompurify` antes de ser renderizado, garantindo a segurança dos usuários finais.
- **Integração com Supabase:** O banco de dados (PostgreSQL) e o armazenamento de imagens (Storage) são gerenciados pelo Supabase, o que torna a aplicação totalmente "stateless" (sem estado), permitindo a hospedagem em múltiplas plataformas simultaneamente (como Render, Netlify, Vercel, etc).

## 🛠 Tecnologias Utilizadas

- [Next.js 14 (App Router)](https://nextjs.org/) - Framework React utilizado tanto para o frontend quanto para a criação de rotas de API do backend.
- [React](https://reactjs.org/) - Biblioteca JavaScript para construção da interface de usuário.
- [Supabase](https://supabase.com/) - Plataforma de backend-as-a-service (BaaS) que fornece o Banco de Dados (PostgreSQL) e o Storage (armazenamento de arquivos).
- [React Quill](https://github.com/zenoamaro/react-quill) - Editor WYSIWYG de texto rico.
- [DOMPurify](https://github.com/cure53/DOMPurify) - Biblioteca para sanitização de HTML para prevenção de ataques XSS.

## ⚙️ Variáveis de Ambiente

Para rodar este projeto localmente ou hospedá-lo, você precisa configurar as seguintes variáveis de ambiente. Crie um arquivo `.env.local` na raiz do projeto com as seguintes chaves:

```env
# URL e Key Pública do Supabase (Usadas no frontend para leitura de dados)
NEXT_PUBLIC_SUPABASE_URL=sua_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_supabase_anon_key

# Chave Privada do Supabase (Usada no backend para modificações no banco de dados e upload de imagens - NUNCA EXPOR NO FRONTEND)
SUPABASE_SERVICE_ROLE_KEY=sua_supabase_service_role_key

# Senha do Painel Administrativo (Usada para acessar a rota /admin)
ADMIN_PASSWORD=sua_senha_super_segura
```

## 📦 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd tutorial-credenciais-erp
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Siga as instruções na seção *Variáveis de Ambiente* acima.

4. **Inicie o servidor de desenvolvimento:**
   (Execute o comando de inicialização local apropriado, ex: 'npm run dev')

5. Acesse no navegador:
   - Interface pública: `http://localhost:3000`
   - Painel de administração: `http://localhost:3000/admin` (será solicitada a senha configurada no `ADMIN_PASSWORD`)

## 📝 Banco de Dados (Supabase)

O projeto requer uma tabela no Supabase chamada `erps` com a seguinte estrutura (schema aproximado):

- `id` (int8, primary key)
- `name` (text, not null) - O nome do ERP (ex: SGP, IXC)
- `title` (text) - Título exibido no tutorial
- `message` (text) - O conteúdo HTML do tutorial (gerado pelo WYSIWYG)
- `image` (text) - URL pública de uma imagem principal (opcional, já que o texto rico suporta imagens inline)

Além disso, é necessário um bucket de Storage no Supabase chamado `images` para o armazenamento das imagens anexadas nos tutoriais, com as políticas de armazenamento (Storage Policies) configuradas para permitir leitura pública e inserção/modificação pelo Service Role (através das rotas seguras do backend).
