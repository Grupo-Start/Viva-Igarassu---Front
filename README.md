# Viva Igarassu — Frontend

Frontend da plataforma **Viva Igarassu**, desenvolvido com **React** e **Vite**, responsável pela interface pública e pelos painéis administrativos do sistema. Esta aplicação consome a API REST do backend para gerenciar pontos turísticos, eventos, empresas, recompensas e usuários.

---

## 📌 Visão Geral

O frontend oferece uma experiência interativa para visitantes e usuários autenticados, além de um **Dashboard Administrativo** para gestão do conteúdo turístico da cidade de Igarassu.

Principais responsabilidades:

* Exibição de informações públicas (home, eventos, pontos turísticos)
* Autenticação de usuários via JWT
* Dashboards administrativos e operacionais
* Comunicação com o backend via API REST

---

## 🚀 Tecnologias Utilizadas

* **React** (componentes funcionais e hooks)
* **Vite** (build e dev server)
* **Axios** (comunicação HTTP)
* **CSS modular por página/componente**
* **JWT** (armazenado em `localStorage`)

---

## 🧱 Arquitetura do Frontend

* **Componentização**: componentes reutilizáveis para layout, formulários e cards
* **Separação por domínio**: páginas organizadas por contexto (Admin, Eventos, Pontos Turísticos, etc.)
* **Serviço central de API**: configuração única do Axios (`src/services/api.js`)
* **Interceptadores**: tratamento global de autenticação e erros HTTP

---

## 📂 Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis (Header, Sidebar, Cards, etc.)
├── paginas/             # Páginas da aplicação
│   ├── AdminDashboard/
│   │   ├── Dashboard/
│   │   ├── Empresas/
│   │   ├── PontosTuristicos/
│   │   ├── Eventos/
│   │   ├── Recompensas/
│   │   └── Users/
│   ├── Home/
│   ├── Login/
│   └── Register/
├── routes/              # Definição e proteção de rotas
├── services/            # Cliente Axios e helpers de API
├── assets/              # Imagens e arquivos estáticos
└── main.jsx
```

---

## 🔐 Autenticação

* Login retorna **JWT** pelo backend
* Token armazenado em `localStorage`
* Interceptador Axios adiciona automaticamente o header:

```http
Authorization: Bearer <token>
```

* Respostas **401 Unauthorized** removem o token e redirecionam para `/login`

---

## 📊 Funcionalidades Principais

### 🌐 Interface Pública

* Listagem de pontos turísticos
* Visualização de eventos culturais
* Navegação informativa sobre Igarassu

### 🛡️ Área Administrativa

* Dashboard com cards de indicadores
* CRUD de:

  * Pontos Turísticos
  * Eventos
  * Empresas
  * Recompensas
* Upload de imagens via **FormData**
* Controle de acesso baseado no perfil retornado pelo backend (`role`)

---

## 🖼️ Upload de Imagens

* Envio via `multipart/form-data`
* Campo padrão: `imagem`
* Integração direta com endpoints do backend
* Compatível com armazenamento local ou Cloudinary (decisão do backend)

⚠️ **Importante:** não definir manualmente o header `Content-Type` ao usar `FormData`.

---

## ⚙️ Configuração do Backend

Por padrão, o frontend espera o backend em:

```text
http://localhost:3001
```

A URL base é configurada em:

```js
src/services/api.js
```

Recomendado usar variável de ambiente:

```env
VITE_API_BASE_URL=http://localhost:3001
```

---

## 🛠️ Pré-requisitos

* **Node.js** versão 18 ou superior
* Backend Viva Igarassu rodando localmente ou em ambiente acessível

---

## ▶️ Instalação e Execução

### Desenvolvimento

```bash
npm install
npm run dev
```

Abra a URL exibida no terminal (ex.: `http://localhost:5173`).

### Build de Produção

```bash
npm run build
npm run preview
```

---

## 🧪 Observações Técnicas

* Tratamento de rotas protegidas via `PrivateRoute`
* Erros de requisição são tratados globalmente pelo Axios
* Layout administrativo compartilha estilos comuns (`admin-common.css`)
* GETs que retornam lista lidam com array vazio para evitar falhas de renderização

---

## 🐞 Depuração Comum

* Tela em branco: verificar erros no **Console do navegador**
* Erros 401 recorrentes: verificar token no `localStorage`
* Problemas de CORS: devem ser resolvidos no backend

---

## 🤝 Contribuição

* Abra **Issues** para bugs ou sugestões
* Envie **PRs pequenos**, com descrição clara
* Mantenha o padrão do projeto:

  * componentes funcionais
  * hooks
  * CSS organizado por página

---

## 📄 Licença

MIT

---

**Viva Igarassu. Viva nossa história.**
