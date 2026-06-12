# Guia de Arquitetura e Estrutura de Pastas (Monorepo)

Este documento descreve o padrão arquitetural adotado no projeto, detalhando a organização de pastas e arquivos tanto do **Back-end** quanto do **Front-end**. Essa estrutura foi projetada para ser modular, altamente escalável, de fácil manutenção e desacoplada de tecnologias específicas.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias principais:
*   **TypeScript**: Linguagem principal utilizada em todo o projeto (front-end, back-end e banco de dados).
*   **Node.js**: Plataforma utilizada para a execução do back-end.
*   **React**: Biblioteca javascript para a construção da interface do front-end.
*   **Prisma ORM**: Utilizado para modelagem de banco de dados, migrações e acesso tipado aos dados.
*   **PostgreSQL**: Banco de dados relacional robusto.
*   **Docker & Docker Compose**: Utilizados para conteinerização e orquestração de serviços de infraestrutura (banco de dados PostgreSQL e serviço do Keycloak).

---

## 1. A Estrutura Monorepo simplificada (`apps/` e `packages/`)

O projeto utiliza o padrão de **Monorepo** gerenciado via **NPM Workspaces** focado nas pastas `apps/` e `packages/`. Em vez de gerenciar múltiplos subpacotes locais complexos, agrupamos as diferentes aplicações do ecossistema e pacotes compartilhados de maneira limpa e direta.

No nível raiz, temos a seguinte divisão:

```text
├── apps/
│   ├── api/          # Back-end da aplicação (Fastify + Node.js + TypeScript)
│   └── web/          # Front-end da aplicação (React + Vite + TypeScript)
├── packages/
│   └── database/     # Camada de banco de dados compartilhada (Prisma + PostgreSQL)
├── package.json      # Configuração global de workspaces do NPM
└── docker-compose.yml # Infraestrutura conteinerizada (Postgres + Keycloak via Docker)
```

### O Poder do Monorepo
A estrutura de monorepo abre portas para expandir o projeto infinitamente sem poluir ou bagunçar o código existente. As configurações e o cliente de banco de dados são isolados na pasta `packages/database`, garantindo que qualquer aplicação dentro de `apps/` possa consumi-los de forma padronizada.

Se você quiser criar novos produtos para o mesmo ecossistema, basta criar subpastas dentro de `apps/`:
*   `apps/mobile`: Um aplicativo móvel em React Native ou Flutter (que consome a mesma API).
*   `apps/admin`: Um painel administrativo web separado para relatórios e gestão interna.
*   `apps/landing-page`: A página institucional de marketing do produto.

---

## 2. Padrão do Back-end (`apps/api`)

O back-end foi desenvolvido seguindo os princípios da **Clean Architecture** (Arquitetura Limpa) e **Hexagonal Architecture** (Portas e Adaptadores). O objetivo principal é garantir que a **regra de negócio** seja completamente independente de banco de dados, frameworks web (Fastify, Express, etc.), bibliotecas externas ou sistemas de arquivos.

Abaixo está o mapeamento detalhado da pasta `apps/api/src`:

```text
apps/api/src/
├── entities/       # Entidades de Domínio puras
├── contracts/      # Interfaces e Contratos (Portas de entrada e saída)
│   ├── repository/
│   ├── usecase/
│   └── gateways/
├── usecase/        # Casos de Uso (Regras de negócio da aplicação)
├── controllers/    # Controladores (Tratamento de requests e respostas)
├── adapters/       # Adaptadores de Framework (Desacoplamento de HTTP)
├── factory/        # Fábricas para Injeção de Dependência manual
├── routes/         # Rotas de exposição HTTP (Fastify)
├── middlewares/    # Políticas globais / Autenticação
└── index.ts        # Inicialização do servidor
```

---

### 2.1. O Padrão Simétrico de Subpastas por Recurso

A arquitetura do back-end adota um **padrão de simetria por recurso (feature/domain)** dentro de cada camada. Isso significa que, para cada recurso do sistema (como `cart` para carrinho, `stock` para estoque, ou `product` para produto), criamos subpastas com **o mesmo nome do recurso** em quase todas as camadas da Clean Architecture.

Esta simetria garante que, ao criar ou alterar um endpoint, você sabe exatamente qual arquivo criar e onde ele se encaixa.

#### 🗺️ Exemplo Prático: Mapeamento do Recurso `cart` (Carrinho)
Se o seu sistema possui um recurso de carrinho de compras (`cart`), os arquivos estarão distribuídos de maneira perfeitamente simétrica através das camadas da seguinte forma:

```text
apps/api/src/
│
├── entities/
│   └── cart-item.ts                         # Entidade pura de domínio (TypeScript livre de ORM/Banco)
│
├── contracts/                               # Portas (Interfaces)
│   ├── repository/
│   │   └── cart-item-repository.ts          # Interface das operações de banco do carrinho
│   └── usecase/
│       └── cart/                            # Subpasta do Recurso
│           ├── create-cart-item-usecase.ts  # Contrato do caso de uso de criação (Input/Output)
│           └── list-cart-items-usecase.ts   # Contrato do caso de uso de listagem (Input/Output)
│
├── usecase/                                 # Lógica de Negócio Concreta
│   └── cart/                                # Subpasta do Recurso
│       ├── create-cart-item.ts              # Implementação da regra de criação
│       └── list-cart-items.ts               # Implementação da regra de listagem
│
├── controllers/                             # Camada de Apresentação Desacoplada (Adaptadores de Entrada)
│   └── cart/                                # Subpasta do Recurso (geralmente mapeado à tabela/entidade)
│       ├── create-cart-item-controller.ts   # Controlador HTTP específico (um por endpoint/ação)
│       ├── list-cart-items-controller.ts    # Controlador HTTP específico para listagem
│       └── dto/                             # Subpasta dedicada para os Data Transfer Objects (DTOs)
│           ├── create-cart-item-dto.ts      # DTO de entrada específico do endpoint de criação
│           └── list-cart-items-dto.ts       # DTO de entrada específico do endpoint de listagem/filtros
│
├── repositories/                            # Driven Adapters (Banco Concreto)
│   └── prisma-cart-item-repository.ts       # Repositório concreto que acessa o PostgreSQL via Prisma ORM
│
├── factory/                                 # Composição / Fábricas de Injeção
│   ├── usecase/
│   │   └── cart/                            # Subpasta do Recurso
│   │       ├── create-cart-item-factory.ts  # Fábrica para instanciar Usecase + PrismaRepo
│   │       └── list-cart-items-factory.ts   # Fábrica para instanciar Usecase + PrismaRepo
│   └── controller/
│       └── cart/                            # Subpasta do Recurso
│           ├── create-cart-item-factory.ts  # Fábrica para instanciar UsecaseFactory + Controller
│           └── list-cart-items-factory.ts   # Fábrica para instanciar UsecaseFactory + Controller
├── routes/                                  # Roteador HTTP do Framework (Fastify/Express)
│   └── cart/                                # Subpasta do Recurso
│       └── cart-routes.ts                   # Registro de endpoints HTTP expostos (ex: POST /cart)
```

---

### 2.2. Explicação Detalhada de Cada Camada

#### 📂 `entities/`
*   **O que é**: Contém os modelos de domínio do seu sistema (ex: `CartItem`, `StockItem`).
*   **Regra**: São classes ou tipos **JavaScript/TypeScript puros**. Elas não contêm nenhuma referência a ORMs (como o Prisma), SDKs de banco de dados, tabelas SQL, decoração de rotas ou bibliotecas de terceiros. Toda a lógica interna de autovalidação ou consistência de dados do próprio objeto deve morar aqui.

#### 📂 `contracts/`
*   **O que é**: São as **Portas (Ports)** da Arquitetura Hexagonal. Contém apenas **interfaces** e definições de tipos TypeScript.
*   *   `repository/`: Define a assinatura dos métodos que o banco de dados deve oferecer (ex: `ICartItemRepository` contendo `create`, `findById`, `listAll`, etc.).
    *   `usecase/`: Define as entradas (Inputs) e saídas (Outputs) de cada ação do sistema, garantindo tipagem forte entre os Controladores e os Casos de Uso.
    *   `gateways/`: Define interfaces para integrações externas (ex: serviços de envio de e-mail, gateways de autenticação ou de pagamento).

#### 📂 `usecase/`
*   **O que é**: Casos de uso (Use Cases) representam as **regras de negócio** específicas da aplicação. É onde a lógica real vive (ex: verificar se um item já está no carrinho antes de incrementar a quantidade).
*   **Organização de Arquivos**: O padrão é ter **um arquivo por caso de uso** (ex: `create-cart-item.ts` e `list-cart-items.ts` separados).
*   **Regra de Ouro**: Eles recebem dados do input, aplicam as validações do negócio, interagem com as interfaces dos repositórios (via injeção de dependência no construtor) e criam as entidades. Eles **nunca** sabem de onde os dados vieram (se foi de um HTTP Request, CLI ou fila) e nem para onde vão. Eles se comunicam apenas usando as interfaces da pasta `contracts/`.

#### 📂 `controllers/`
*   **O que é**: Faz o meio de campo entre o mundo exterior (HTTP) e os Casos de Uso. É a porta de entrada da aplicação que intercepta as solicitações de rede.
*   **Organização e Padrão de Pastas (Reforçado)**:
    *   **Subpastas por Recurso/Tabela**: Dentro de `controllers/`, criamos pastas nomeadas de acordo com a entidade/tabela correspondente (ex: `controllers/cart/`, `controllers/area/`, `controllers/product/`).
    *   **Controladores Unitários (SRP)**: Cada endpoint ou ação HTTP tem o seu próprio arquivo de controlador isolado (ex: `create-cart-item-controller.ts`, `delete-cart-item-controller.ts`). **Nunca** declare rotas ou ações diferentes no mesmo arquivo de controlador.
    *   **Subpasta `dto/` isolada**: Dentro da pasta de cada recurso, deve existir uma pasta `dto/` contendo os objetos de transferência de dados e validações estruturais.
    *   **Um arquivo de DTO por endpoint/operação**: Cada entrada que necessite de validação sintática (seja no `body`, `query params` ou `route params`) deve ter seu arquivo DTO dedicado (ex: `create-cart-item-dto.ts`, `update-cart-item-dto.ts`). Não reutilize DTOs para propósitos muito diferentes para evitar acoplamento desnecessário.
*   **Responsabilidade**: O controlador extrai os dados brutos da requisição HTTP (`body`, `params`, `query`), executa a validação sintática instanciando as classes DTO correspondentes (usando decorators de validação como os do `class-validator` e `class-transformer`), e repassa o payload limpo e tipado para o Caso de Uso. O retorno do controlador é sempre um objeto genérico padronizado contendo `{ statusCode, body }`, desacoplando completamente a lógica do framework web (Fastify, Express, etc.).

#### 📂 `adapters/` (Adaptador de Framework)
*   **O que é**: Adaptadores para encaixar os frameworks externos à nossa arquitetura.
*   O melhor exemplo é o `fastify-route-adapter.ts`. Ele recebe um controlador genérico (que tem apenas o método `handle(request: HttpRequest): Promise<HttpResponse>`) e o adapta para o formato de função do Fastify (`async (request, reply) => { ... }`).
*   **Benefício**: Se amanhã você quiser trocar o Fastify pelo Express ou NestJS, basta criar um novo `adapter`. Os seus `controllers` e `usecases` permanecem intocados.

#### 📂 `factory/` (Injeção de Dependências Manual)
*   **O que é**: Camada responsável por montar o quebra-cabeça. É aqui que resolvemos as dependências (Dependency Injection) de forma limpa, explícita e manual.
*   Temos subpastas `/usecase` e `/controller`, cada uma organizada por recursos (ex: `/cart`).
*   Exemplo de fluxo em uma fábrica:
    1. Instancia o repositório concreto (ex: `PrismaCartItemRepository` usando o Prisma Client).
    2. Instancia o Caso de Uso injetando o repositório no construtor.
    3. Instancia o Controller injetando o Caso de Uso no construtor.
    4. Retorna o Controller pronto para ser consumido pelas rotas.

#### 📂 `routes/`
*   **O que é**: Configuração das rotas HTTP do Fastify.
*   **Regra**: São arquivos muito enxutos organizados por recursos. Eles apenas definem o verbo HTTP, o endpoint, aplicam os `middlewares` (como autenticação) e chamam a Factory do controlador correspondente passando pela função adaptadora (`adaptRoute`).

---

### 2.3. Vantagens do Padrão Simétrico de Subpastas

1.  **Responsabilidade Única (SRP - Single Responsibility Principle)**: Em vez de ter arquivos gigantes como `cart-controller.ts` ou `cart-service.ts` com centenas de linhas contendo todas as operações de CRUD, cada ação tem seu próprio par de arquivos (`create-cart-item-controller.ts` + `create-cart-item.ts`). Isso facilita a leitura, manutenção e evita conflitos de código em equipes.
2.  **Modularidade Extrema**: Se você precisar remover ou reescrever completamente um recurso do sistema (ex: mudar o carrinho de compras), você sabe exatamente onde estão todos os arquivos envolvidos de ponta a ponta sem impactar as outras partes do sistema.
3.  **Localização Imediata de Código**: A simetria de pastas (`usecase/cart`, `controllers/cart`, `factory/controller/cart`, `routes/cart`) torna a navegação intuitiva: se você está alterando o comportamento do carrinho, você abrirá a pasta `/cart` de cada camada.

---

## 3. Padrão do Front-end (`apps/web`)

O front-end é uma aplicação moderna baseada em **React (v19) + Vite + TypeScript** estruturada utilizando o conceito de **Feature-Driven Architecture** (Arquitetura Guiada por Funcionalidades ou Feature Folders). 

Em vez de organizar o projeto por tipos técnicos de arquivos (colocar todos os componentes juntos, todas as páginas juntas, todos os hooks juntos), o código é agrupado por **domínio de negócio**.

Abaixo está o mapeamento detalhado da pasta `apps/web/src`:

```text
apps/web/src/
├── app/            # Estado global e hooks principais do core
├── assets/         # Imagens, fontes e mídias estáticas globais
├── components/     # Componentes globais e compartilhados
│   └── ui/         # Componentes primitivos de interface (ex: buttons, inputs)
├── features/       # Módulos isolados por funcionalidade do negócio
│   ├── auth/
│   ├── stock/      # Exemplo de Feature (Estoque)
│   │   ├── api/        # Chamadas de API e Hooks do React Query
│   │   ├── components/ # Componentes visuais exclusivos do estoque
│   │   └── routes/     # Páginas/Telas exclusivas do estoque
│   └── menu/
├── lib/            # Configurações de clientes (Axios, Keycloak, etc.)
├── routes/         # Router central da aplicação (React Router)
├── utils/          # Helpers de formatação e utilitários globais
├── App.tsx         # Componente raiz
├── main.tsx        # Ponto de entrada do React
└── index.css       # Estilização global com Tailwind CSS (v4)
```

### Detalhamento da Estrutura

#### 📂 `features/`
Essa é a pasta mais importante do front-end. Cada subpasta representa um módulo autocontido:
*   **`api/` (dentro de cada Feature)**: Centraliza as requisições HTTP (usando **Axios**) e o gerenciamento de estado assíncrono/cache do servidor (usando **TanStack React Query**). Isso deixa as telas livres de lógica de busca de dados.
*   **`components/` (dentro de cada Feature)**: Telas específicas, modais, formulários ou listagens que só fazem sentido dentro daquela regra de negócio (ex: o modal de vincular ingrediente ao produto do estoque).
*   **`routes/` (dentro de cada Feature)**: Representa os componentes de página que serão acoplados ao roteador global.

#### 📂 `components/ui/`
*   Inspirado no padrão de design do **shadcn/ui**, contém componentes de apresentação puros, reutilizáveis e genéricos (como `Button`, `Input`, `Dialog`, `Table`, `Badge`).
*   Eles não possuem nenhuma lógica de negócio, apenas estilos estritos definidos com classes do **Tailwind CSS**.

#### 📂 `lib/`
*   Configurações e instâncias globais de ferramentas de terceiros. Por exemplo:
    *   `axios.ts`: Configura o cliente HTTP injetando headers de autorização automaticamente a partir do token de autenticação.

#### 📂 Tech Stack Principal do Front-end:
*   **Zustand**: Gerenciamento de estado global leve e reativo (para estados globais da interface ou dados do usuário logado).
*   **TanStack Query (React Query)**: Sincronização e cache do estado do servidor, eliminando a necessidade de usar Redux ou Context para controlar requisições.
*   **React Hook Form + Zod**: Gerenciamento e validação extremamente performática de formulários.
*   **Lucide React**: Biblioteca rica de ícones vetoriais modernos.
*   **Sonner**: Toast notifications elegantes e animadas.
*   **Tailwind CSS v4**: Processamento de estilos CSS moderno e extremamente rápido.

---

## 4. Benefícios Arquiteturais desse Modelo para o seu Projeto

Ao adotar essa organização de arquivos, você terá as seguintes vantagens:

1.  **Independência de Banco de Dados**: A divisão em `contracts/repository` e a implementação física em `repositories/` (ex: `PrismaStockItemRepository.ts` utilizando o Prisma ORM) permite que o seu domínio/usecase permaneça 100% livre de acoplamento direto com a tecnologia de banco de dados. Se no futuro você decidir migrar do PostgreSQL para qualquer outro banco (ou trocar o ORM), basta criar uma nova classe concreta de repositório e injetá-la nas factories.
2.  **Facilidade de Testabilidade**: Como a lógica do back-end está 100% isolada em `usecase/` com injeção de dependência por interfaces, você consegue testar todas as regras de negócio unitariamente em segundos usando Mocks dos repositórios, sem precisar subir um banco de dados real ou servidor HTTP.
3.  **Front-end Limpo e Modular**: A estrutura baseada em `features` impede que o front-end se transforme em uma "colcha de retalhos". Se uma funcionalidade for descartada ou refeita (ex: mudar o fluxo de estoque), você altera ou deleta apenas a pasta `features/stock/`, sem risco de quebrar o restante da aplicação.
4.  **Escalabilidade Infinita com o Monorepo**: Se o projeto crescer e demandar novos tipos de clientes ou serviços (como um aplicativo móvel em `apps/mobile`, ou um painel administrativo em `apps/admin`), o ecossistema já está preparado para acomodá-los reutilizando os pacotes compartilhados (como o `packages/database`).
