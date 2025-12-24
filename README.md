# Viva Igarassu - Frontend

Este projeto é o frontend do sistema Viva Igarassu, desenvolvido em React + Vite.

## Funcionalidades
- Dashboard administrativo para empresas, pontos turísticos, eventos, recompensas e usuários
- CRUD completo para recompensas, incluindo upload de imagem e associação automática à empresa do perfil
- Sidebar de navegação com acesso rápido às páginas principais
- Autenticação via JWT
- Integração com backend via Axios
- Visualização de estatísticas e tabelas dinâmicas

## Estrutura de Pastas
```
src/
  componentes/         # Componentes reutilizáveis
  paginas/             # Páginas do sistema
    AdminDashboard/    # Páginas administrativas
      Empresas/
      PontosTuristicos/
      Eventos/
      Recompensas/
      Users/
  routes/              # Rotas do sistema
  services/            # Integração com API
  assets/              # Imagens e arquivos estáticos
```

## Como rodar o projeto
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Observações
- O campo de empresa nas recompensas é preenchido automaticamente pelo perfil logado.
- O upload de imagem é feito via FormData e salvo no backend.
- O sidebar não possui mais o item "Configurações".

## Requisitos
- Node.js >= 18
- Backend rodando em [http://localhost:3001](http://localhost:3001)

## Licença
MIT
