# 🚀 Gestão Quatro5 - Monorepo (Clean Architecture)

Este é o projeto **Gestão Quatro5**, estruturado como um monorepo gerenciado por **NPM Workspaces** utilizando os princípios da **Clean Architecture (Arquitetura Limpa)**. O projeto é composto por uma API back-end em Fastify, uma aplicação front-end em React + Vite, e um banco de dados PostgreSQL com controle de autenticação/papéis centralizado via Keycloak.

---

## 📂 Estrutura do Monorepo

*   `apps/api`: Servidor back-end (Node.js + Fastify + TypeScript).
*   `apps/web`: Aplicação front-end (React + Vite + Tailwind CSS).
*   `packages/database`: Pacote compartilhado contendo o Prisma Client e o schema do banco de dados.

---

## 🛠️ Pré-requisitos

Certifique-se de ter instalado em sua máquina:
*   [Node.js](https://nodejs.org/) (v18+)
*   [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

---

## ⚙️ Variáveis de Ambiente

O projeto utiliza um arquivo `.env` na raiz para configuração de banco de dados e autenticação Keycloak.
Se necessário, duplique o `.env.example` e salve como `.env`:
```bash
cp .env.example .env
```

---

## 🚀 Como Executar o Projeto

Siga os passos a seguir para rodar a aplicação localmente com dados populados:

### 1. Instalar as Dependências
Instale as dependências de todas as aplicações e pacotes compartilhados na raiz do projeto:
```bash
npm install
```

### 2. Subir a Infraestrutura (Postgres e Keycloak)
Suba os containers do Docker em segundo plano:
```bash
docker compose up -d
```
*   **Banco de Dados Principal (Postgres)**: Mapeado na porta `5437`
*   **Keycloak Admin Console**: Disponível em `http://localhost:8081` (Admin: `admin` / Senha: `admin_password`)

### 3. Sincronizar o Schema do Prisma
A partir da raiz do projeto, aplique as migrações e atualize o banco de dados local com as últimas alterações do schema:
```bash
npx prisma db push --schema=packages/database/prisma/schema.prisma
```

### 4. Popular o Banco de Dados (Database Seeding)
Para rodar a aplicação com tarefas de teste, histórico de velocidade e usuários já criados, execute o script de seeding:
```bash
npm run db:seed
```
> 💡 *Nota: Este comando limpa a base de dados atual e cria registros fictícios de tarefas (ativas e arquivadas), usuários sincronizados e histórico de relatórios semanais.*

### 5. Rodar os Servidores de Desenvolvimento
Execute os comandos abaixo (em terminais separados) a partir da raiz do projeto:

*   **Rodar Back-end (API)**:
    ```bash
    npm run api
    ```
    *A API rodará em `http://localhost:3000`.*

*   **Rodar Front-end (Web)**:
    ```bash
    npm run web
    ```
    *O front-end iniciará em `http://localhost:5173` (ou porta alternativa exibida no terminal).*

---

## 🔐 Configuração e Backup do Keycloak

Para garantir que o projeto funcione **de primeira** em qualquer máquina sem precisar reconfigurar o Keycloak manualmente, nós configuramos a importação automática do Realm.

### Como funciona o Import automático?
O arquivo `keycloak-realm.json` na raiz do projeto contém todas as configurações do realm `quatro5`, incluindo clientes (`gestao-quatro5-api`), papéis (`admin`, `user`) e usuários criados. O Docker Compose está configurado para ler esse arquivo e importá-lo automaticamente no startup inicial do Keycloak.

### Como atualizar o Backup do Keycloak (Realm Export)?
Se você criar novos usuários, alterar papéis ou modificar permissões no Keycloak e quiser salvar esse estado atualizado no projeto:

1. Com o container do Keycloak rodando, execute o comando de exportação oficial do Keycloak:
   ```bash
   docker exec -it gestao-quatro5-keycloak /opt/bitnami/keycloak/bin/kc.sh export --file /tmp/quatro5-realm.json --realm quatro5 --users realm_file
   ```
2. Copie o arquivo exportado de dentro do container para a raiz do seu projeto local:
   ```bash
   docker cp gestao-quatro5-keycloak:/tmp/quatro5-realm.json ./keycloak-realm.json
   ```
3. Realize o commit do arquivo `keycloak-realm.json` atualizado. Quando outra pessoa clonar o repositório e rodar `docker compose up -d`, ela receberá o Keycloak idêntico ao seu!

---

## 👥 Contas de Teste Pré-Configuradas

Ao popular o banco de dados usando `npm run db:seed` com o Keycloak importado, você poderá acessar o sistema utilizando as seguintes credenciais:

### 👑 Administrador (Acesso ao painel e ações de encerramento de ciclo)
*   **E-mail / Usuário**: `nascimentocarvalho894@gmail.com`
*   **Senha**: `123456`

### 💻 Usuário Desenvolvedor (Acesso padrão)
*   **E-mail / Usuário**: `dev@gmail.com`
*   **Senha**: `123456` (ou senha configurada na importação do keycloak-realm)
