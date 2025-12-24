# Viva Igarassu — Frontend

Frontend do sistema Viva Igarassu, criado em React + Vite. Esta aplicação fornece a interface
administrativa (Admin Dashboard) e as páginas públicas para gerenciar pontos turísticos, eventos,
empresas, recompensas e usuários.

Principais características
- Dashboard administrativo com cards de estatísticas e gráficos
- CRUD para Recompensas, Eventos, Empresas e Pontos Turísticos
- Upload de imagens usando FormData
- Autenticação JWT com armazenamento do token em `localStorage`
- Integração com backend via Axios (`src/services/api.js`)

Estrutura principal
```
src/
  components/         # Componentes reutilizáveis
  paginas/            # Páginas (AdminDashboard, Login, Register, etc.)
    AdminDashboard/
      Dashboard/
      Empresas/
      PontosTuristicos/
      Eventos/
      Recompensas/
      Users/
  routes/             # Definição de rotas
  services/           # Cliente axios e serviços (API)
  assets/             # Imagens e estáticos
```

Requisitos
- Node.js >= 18
- Backend disponível (por padrão esperado em `http://localhost:3001`)

Instalação e execução (desenvolvimento)
1. Instale dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Abra o endereço exibido no terminal (por exemplo `http://localhost:5173`).

Build e preview

```bash
npm run build
npm run preview
```

Configuração do backend
- Por padrão o cliente HTTP aponta para `http://localhost:3001` (veja `src/services/api.js`).
- Se necessário, atualize a URL do backend nesse arquivo ou ajuste para usar uma variável de ambiente.

Login de administrador
- Para testar permissões de admin a aplicação verifica o perfil retornado pelo backend (campos `role`, `tipo` ou `isAdmin`).

Notas de desenvolvimento
- O layout do admin utiliza `admin-common.css` para estilos compartilhados entre páginas.
- Interceptadores Axios tratam 401 removendo o token e redirecionando para `/login`.
- Tratamento de 404 em chamadas GET retorna arrays vazios para evitar erros de render.

Depuração comum
- Se a aplicação carregar em branco ao navegar, abra o Console do navegador para ver erros de runtime.
- Problemas de CORS devem ser resolvidos no backend (habilitar origin do frontend).

Contribuindo
- Sinta-se à vontade para abrir PRs com correções e melhorias. Mantenha consistência com o estilo
  existente (componentes funcionais, hooks e CSS por página).

Licença
- MIT
