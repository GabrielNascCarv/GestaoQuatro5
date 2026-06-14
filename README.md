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

## 🔐 Automação do Keycloak

Para garantir que o projeto funcione **de primeira** sem necessidade de configurações manuais (como criar Realms, Clients ou Roles), o Keycloak está configurado com **importação automática**.

O arquivo `keycloak-realm.json` na raiz do projeto já contém a estrutura necessária (clientes, escopos, atributos e os usuários de teste pré-cadastrados). O `docker-compose.yml` monta e importa esse arquivo no momento em que você executa o comando `docker compose up -d`. **Nenhuma ação é necessária por parte de quem clona o repositório.**

---

---

## 👥 Contas de Teste Pré-Configuradas

Ao popular o banco de dados usando `npm run db:seed` com o Keycloak importado, você poderá acessar o sistema utilizando as seguintes credenciais:

### 👑 Administrador (Acesso ao painel e ações de encerramento de ciclo)
*   **E-mail / Usuário**: `nascimentocarvalho894@gmail.com`
*   **Senha**: `123456`

### 💻 Usuário Desenvolvedor (Acesso padrão)
*   **E-mail / Usuário**: `dev@gmail.com`
*   **Senha**: `123456`

---

## 🎯 Metodologia de Gestão Adotada

Para solucionar as dores do Ricardo, o projeto adota um modelo híbrido combinando **Kanban** e **Ciclos Semanais (Sprints Curtas)**:

1. **Visualização por Kanban**: Organiza as tarefas em quatro colunas (*A Fazer*, *Em Desenvolvimento*, *Em Revisão* e *Concluído*). Isso elimina o problema de tarefas espalhadas em papel/WhatsApp, permitindo a centralização e acompanhamento do fluxo de trabalho do time em tempo real.
2. **Ciclos Semanais (Sprints)**: Toda segunda-feira o time planeja e executa tarefas em um ciclo curto. No final da semana (ou no início da próxima), o Administrador realiza o **Fechamento de Semana**, o que limpa o quadro para o novo ciclo e arquiva os dados do ciclo concluído em um **Relatório Semanal**. Isso resolve a falta de números nas reuniões de segunda, gerando um histórico confiável.

---

## 📈 Justificativa dos Indicadores (KPIs)

Cada indicador foi projetado para munir o Ricardo de dados para tomada de decisão ágil:

1. **Carga de Trabalho do Time (Workload Balancer)**:
   * **O que é**: Exibe a pontuação ativa de tarefas por colaborador, categorizando-os em *Ocioso* (0 pts), *Ideal* (1-10 pts), *Alerta* (11-15 pts) ou *Sobrecarregado* (>15 pts).
   * **Decisão do Ricardo**: Permite identificar gargalos de produtividade ("gente afogada e gente ociosa"). Ao ver um colaborador em estado de *Sobrecarregado* (vermelho), Ricardo decide redistribuir tarefas ativas para quem está *Ocioso* (cinza) ou *Ideal* (verde) antes que os prazos estourem.
2. **Prazos em Risco (Critical Deadlines)**:
   * **O que é**: Lista de forma prioritária as tarefas não concluídas que já venceram ou vencem nas próximas 48 horas.
   * **Decisão do Ricardo**: Permite agir proativamente antes do cliente reclamar. Ao bater o olho nas tarefas vermelhas desta seção, Ricardo decide entrar em contato direto com o responsável pela tarefa crítica para remover impedimentos ou renegociar o prazo com antecedência.
3. **Velocidade Semanal (Weekly Velocity)**:
   * **O que é**: Compara a soma da pontuação das tarefas concluídas no ciclo ativo com a pontuação concluída no último relatório fechado (semana anterior), exibindo a tendência de crescimento ou queda (%).
   * **Decisão do Ricardo**: Ricardo utiliza a velocidade para planejar a capacidade do time para a próxima semana. Se a velocidade estiver em queda constante, ele pode decidir rever processos ou diminuir a carga de escopo da próxima Sprint.
4. **Status do Fluxo (Flow Status)**:
   * **O que é**: Representado de forma quantitativa pelos cards de resumo no topo do Painel (*Total de Tarefas*, *Pontos Ativos*, *Prazos Críticos* e *Concluídas*) e visualmente pelas colunas do quadro Kanban (*A Fazer*, *Em Desenvolvimento*, *Em Revisão* e *Concluído*).
   * **Decisão do Ricardo**: Ajuda a identificar gargalos no fluxo de trabalho. Se há um acúmulo excessivo de tarefas na coluna "Em Revisão" do Kanban, ou se a proporção de tarefas ativas versus concluídas nos cards do Painel estiver desbalanceada, Ricardo decide intervir na etapa específica (ex: homologação) para destravar as entregas do time.

---

## ✂️ Decisões de Escopo e Cortes (Trade-offs)

Para garantir a entrega de uma arquitetura limpa e funcional no prazo de 48 horas, foram tomadas as seguintes decisões de cortes:
* **Interface de Gerenciamento de Usuários**: A criação e exclusão de contas foram delegadas ao Keycloak. Os usuários são provisionados e sincronizados no banco de dados automaticamente através do arquivo de semente (`seed.ts`), mantendo o foco do desenvolvimento no dashboard e nas tarefas.
* **Histórico Evolutivo Completo**: Em vez de gráficos interativos de linha de longo prazo (como *Cumulative Flow Diagram*), optou-se por focar na comparação semanal ágil (velocidade da semana ativa vs. anterior) e num visualizador dropdown de relatórios antigos, otimizando o tempo de entrega sem perder o histórico do Ricardo.
* **Atribuição Manual Complexa**: Em vez de fluxos complexos de delegação de tarefas, a ferramenta foca em auto-atribuição rápida de tarefas ativas e troca de status direta no Kanban para simplificar a usabilidade inicial.

---

## 🔮 O que faria com mais tempo?

Caso o projeto contasse com um prazo maior, seriam implementadas as seguintes melhorias:
1. **Segurança e Proteção das Rotas**: Como as rotas de API do monorepo estão expostas publicamente por fins de facilitação e agilidade do desenvolvimento local, implementaria middlewares de validação de token JWT e controle de papéis (RBAC) com o Keycloak nas rotas da API para torná-las 100% seguras.
2. **Recuperação de Senha via E-mail**:
   * Implementação de endpoint de "esqueci minha senha" para gerar e enviar um código de recuperação temporário via e-mail do usuário (integrado a serviços como Amazon SES, SendGrid ou Nodemailer).
   * Implementação de um endpoint de validação encarregado de ler o código enviado, compará-lo com o hash salvo no banco de dados e liberar a criação de uma nova credencial após a validação bem-sucedida.
3. **Refinamento na Estimativa de Pontuação das Tarefas**: Atualmente, a pontuação das tarefas é informada de forma direta e manual, assumindo que o Ricardo sabe exatamente quanto vale cada tarefa. Como na realidade ele pode não saber mensurar esse valor, implementaria um assistente ou modelo de estimativa de complexidade (ex: tamanho de camiseta P/M/G ou nível de esforço simplificado de 1 a 5) que converteria as respostas dele em pontuação de forma intuitiva.
