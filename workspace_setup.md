# 🚀 Guia de Configuração e Estrutura do Monorepo

Este projeto foi inicializado seguindo a estrutura do guia de **Clean Architecture** e configurado utilizando **NPM Workspaces** para gerenciar as aplicações (`apps/`) e pacotes (`packages/`).

---

## 📂 Estrutura de Pastas Criada

Abaixo está o mapeamento dos arquivos criados para o funcionamento inicial do projeto:

```text
├── apps/
│   ├── api/                              # Back-end Fastify
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                  # Ponto de entrada do servidor
│   │       ├── adapters/
│   │       │   └── fastify-route-adapter.ts # Adaptador de rotas desacoplado
│   │       ├── entities/
│   │       │   └── user.ts               # Entidade pura do domínio
│   │       ├── contracts/
│   │       │   ├── repository/
│   │       │   │   └── user-repository.ts # Contrato do repositório
│   │       │   └── usecase/
│   │       │       └── user/
│   │       │           └── create-user-usecase.ts # Contrato do caso de uso
│   │       ├── usecase/
│   │       │   └── user/
│   │       │       └── create-user.ts    # Implementação do caso de uso
│   │       ├── controllers/
│   │       │   └── user/
│   │       │       ├── create-user-controller.ts # Controlador do endpoint
│   │       │       └── dto/
│   │       │           └── create-user-dto.ts # DTO com validações
│   │       ├── factory/
│   │       │   ├── usecase/
│   │       │   │   └── user/
│   │       │   │       └── create-user-factory.ts # Fábrica do caso de uso
│   │       │   └── controller/
│   │       │       └── user/
│   │       │           └── create-user-factory.ts # Fábrica do controlador
│   │       └── routes/
│   │           ├── user/
│   │           │   └── user-routes.ts    # Rotas de usuário
│   │           └── index.ts              # Roteador central da API
│   └── web/                              # Front-end React + Vite + Tailwind CSS v4
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.app.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx                   # Starter component com Tailwind v4
│           └── index.css                 # Importações de tema do Tailwind
├── packages/
│   └── database/                         # Pacote de Banco de Dados Compartilhado
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   └── index.ts                  # Exporta a instância do Prisma Client
│       └── prisma/
│           └── schema.prisma             # Schema do Prisma com a tabela User
├── docker-compose.yml                    # Infraestrutura com PostgreSQL e Keycloak
├── .env                                  # Variáveis de ambiente configuradas
└── .env.example
```

---

## 🛢️ Banco de Dados (Prisma Schema)

O arquivo `packages/database/prisma/schema.prisma` foi inicializado com a tabela de usuário (`User`):

```prisma
model User {
  id         String    @id @default(uuid())
  name       String
  email      String    @unique
  password   String
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?

  @@map("users")
}
```

---

## 🛠️ Como Executar o Projeto

Siga os passos abaixo para subir a infraestrutura e iniciar o desenvolvimento:

### 1. Iniciar os Containers (PostgreSQL & Keycloak)
Execute o comando abaixo no seu terminal para iniciar os containers:
```bash
sudo docker compose up -d
```

As portas mapeadas são:
*   **Banco de Dados Principal (App)**: `5437` (Para acessar via DBeaver)
*   **Banco de Dados do Keycloak**: `5438`
*   **Serviço do Keycloak**: `8081` (Painel Admin: `http://localhost:8081`, Admin: `admin` / Senha: `admin_password`)

### 2. Executar as Migrações do Banco
Uma vez que o banco de dados esteja rodando, execute as migrations do Prisma para criar a tabela `users`:
```bash
npm run prisma:migrate --workspace=packages/database
```
*Digite um nome para a migração quando solicitado (ex: `init`).*

### 3. Rodar os Servidores de Desenvolvimento

No nível raiz do projeto, você pode iniciar o back-end e o front-end usando os scripts integrados do workspace:

*   **Rodar o Back-end (Fastify):**
    ```bash
    npm run api
    ```
    *O servidor rodará em `http://localhost:3000` e a rota criada estará disponível em `POST http://localhost:3000/api/users`.*

*   **Rodar o Front-end (Vite + React):**
    ```bash
    npm run web
    ```
    *O front-end iniciará e a URL de acesso local será exibida no terminal.*

---

## 🧪 Testando o Endpoint de Usuário

Você pode testar a criação de usuário enviando uma requisição HTTP POST para `http://localhost:3000/api/users`:

**Exemplo de Payload (JSON):**
```json
{
  "name": "Gabriel",
  "email": "gabriel@example.com",
  "password": "senha_segura"
}
```
