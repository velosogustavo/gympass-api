# 🏋️ GymPass Style App

API REST de check-in em academias no estilo **Gympass**, desenvolvida como projeto de estudo aplicando os princípios **SOLID**, testes automatizados e boas práticas de arquitetura. Usuários fazem check-in em academias próximas; administradores validam check-ins e cadastram academias.

## ✨ Funcionalidades

- 👤 Cadastro e autenticação de usuários com **JWT** + **refresh token** (cookie httpOnly)
- 🔐 Controle de acesso por papéis (**RBAC**): `MEMBER` e `ADMIN`
- 📍 Busca de academias por nome e por **geolocalização** (proximidade até 10km)
- ✅ Check-in em academias com validação de distância (100m) e limite de 1 por dia
- 🛡️ Validação de check-ins e cadastro de academias restritos a administradores
- 📊 Histórico e métricas de check-ins do usuário

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Fastify** — servidor HTTP
  - `@fastify/jwt` — autenticação via JWT
  - `@fastify/cookie` — refresh token em cookie httpOnly
- **Prisma ORM** + **PostgreSQL**
- **Zod** — validação de dados de entrada
- **bcryptjs** — hash de senhas
- **dayjs** — manipulação de datas
- **Vitest** + **Supertest** — testes unitários e e2e
- **Docker** — banco de dados em container
- **GitHub Actions** — CI (testes unitários a cada push, e2e a cada PR)

## 🏛 Arquitetura

O projeto segue os princípios **SOLID** com separação clara de responsabilidades:

- **Controllers** (`http/controllers`) — recebem a requisição, validam com Zod e chamam o caso de uso.
- **Use Cases** (`use-cases`) — regras de negócio isoladas do framework HTTP.
- **Repositories** (`repositories`) — abstração de acesso a dados via interface, com duas implementações:
  - `prisma/` — usada em produção/desenvolvimento (PostgreSQL).
  - `in-memory/` — usada nos testes unitários (rápida, sem banco).
- **Factories** (`use-cases/factories`) — montam os casos de uso com suas dependências.

Esse desenho (padrão **Repository** + injeção de dependência) permite testar as regras de negócio sem subir banco, e trocar a fonte de dados sem alterar os casos de uso.

## 📂 Estrutura de pastas

```
src/
├── @types/           # extensões de tipos (ex.: payload do JWT)
├── env/              # validação das variáveis de ambiente (Zod)
├── http/
│   ├── controllers/  # rotas e handlers (users, gyms, check-ins)
│   └── middlewares/  # verifyJWT, verifyUserRole (RBAC)
├── lib/              # instância do Prisma
├── repositories/
│   ├── in-memory/    # implementações para testes
│   └── prisma/       # implementações com PostgreSQL
├── use-cases/
│   ├── errors/       # erros de domínio
│   └── factories/    # montagem dos casos de uso
└── utils/            # helpers (ex.: cálculo de distância, test utils)
```

## ⚙️ Como rodar

Pré-requisitos: **Node.js 22+** e **Docker**.

```bash
# 1. Instalar dependências
npm install

# 2. Subir o banco PostgreSQL (Docker)
docker compose up -d

# 3. Configurar variáveis de ambiente
cp .env.example .env
# edite o .env preenchendo JWT_SECRET (veja abaixo)

# 4. Rodar as migrations do Prisma
npx prisma migrate dev

# 5. Iniciar o servidor de desenvolvimento
npm run start:dev
```

A API sobe em **http://localhost:3333**.

## 🔑 Variáveis de ambiente

Crie um `.env` na raiz com:

```env
NODE_ENV=dev
JWT_SECRET=sua-chave-secreta-aqui
DATABASE_URL="postgresql://docker:docker@localhost:5432/apisolid?schema=public"
```

## 📜 Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run start:dev` | Sobe o servidor em modo watch (desenvolvimento) |
| `npm start` | Executa a versão buildada (`build/server.js`) |
| `npm run build` | Compila o projeto com tsup |
| `npm run lint` | Roda o ESLint |
| `npm run test` | Testes unitários (casos de uso) |
| `npm run test:e2e` | Testes end-to-end (precisa do Postgres) |
| `npm run test:coverage` | Relatório de cobertura |
| `npm run test:ui` | Interface visual do Vitest |

## 🌐 Rotas da API

> 🔒 = requer JWT · 👑 = requer papel `ADMIN`

### Usuários

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/users` | Cadastro de usuário | Público |
| `POST` | `/sessions` | Login (retorna JWT + refresh cookie) | Público |
| `PATCH` | `/token/refresh` | Renova o access token via cookie | Cookie |
| `GET` | `/me` | Perfil do usuário logado | 🔒 |

### Academias

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/gyms/search` | Busca academias pelo nome | 🔒 |
| `GET` | `/gyms/nearby` | Academias próximas (até 10km) | 🔒 |
| `POST` | `/gyms` | Cadastra academia | 🔒 👑 |

### Check-ins

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/check-ins/history` | Histórico de check-ins | 🔒 |
| `GET` | `/check-ins/metrics` | Total de check-ins do usuário | 🔒 |
| `POST` | `/gyms/:gymId/check-ins` | Realiza check-in numa academia | 🔒 |
| `PATCH` | `/check-ins/:checkInId/validate` | Valida um check-in | 🔒 👑 |

## 🔐 Autenticação e autorização

- **Access token** (JWT): validade de **10 minutos**, enviado no header `Authorization: Bearer <token>`.
- **Refresh token**: validade de **7 dias**, armazenado em cookie **httpOnly**. Use `PATCH /token/refresh` para obter um novo access token sem refazer login — o cookie é enviado automaticamente pelo cliente.
- **RBAC** (Role-Based Access Control): usuários têm papel `MEMBER` (padrão) ou `ADMIN`. Rotas administrativas (validar check-in, cadastrar academia) são protegidas pelo middleware `verifyUserRole('ADMIN')`.

## 🧪 Testes

```bash
npm run test         # unitários (regras de negócio, repositório in-memory)
npm run test:e2e     # end-to-end (rotas HTTP + Postgres)
npm run test:coverage # cobertura
```

Os testes unitários usam repositórios em memória (sem banco). Os e2e sobem a aplicação de verdade e rodam contra um PostgreSQL — no CI, isso acontece via GitHub Actions.

---

## 📋 Requisitos e regras de negócio

### RFs (Requisitos funcionais)

- [x] Deve ser possível se cadastrar;
- [x] Deve ser possível se autenticar;
- [x] Deve ser possível obter o perfil de um usuário logado;
- [x] Deve ser possível obter o número de check-ins realizados pelo usuário logado;
- [x] Deve ser possível o usuário obter seu histórico de check-ins;
- [x] Deve ser possível o usuário buscar academias próximas (até 10km);
- [x] Deve ser possível o usuário buscar academias pelo nome;
- [x] Deve ser possível o usuário realizar check-in em uma academia;
- [x] Deve ser possível validar o check-in de um usuário;
- [x] Deve ser possível cadastrar uma academia;

### RNs (Regras de negócio)

- [x] O usuário não deve poder se cadastrar com um e-mail duplicado;
- [x] O usuário não deve poder fazer 2 check-ins no mesmo dia;
- [x] O usuário não pode fazer check-in se não estiver perto (100m) da academia;
- [x] O check-in só pode ser validado até 20 minutos após criado;
- [x] O check-in só pode ser validado por administradores;
- [x] A academia só pode ser cadastrada por administradores;

### RNFs (Requisitos não funcionais)

- [x] A senha do usuário precisa estar criptografada;
- [x] Os dados da aplicação precisam estar persistidos em um banco PostgreSQL;
- [x] Todas as listas de dados precisam estar paginadas com 20 itens por página;
- [x] O usuário deve ser identificado por um JWT (JSON Web Token);
