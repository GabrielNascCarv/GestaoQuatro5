import { PrismaClient, TaskStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clear existing data
  console.log('🧹 Clearing existing database records...');
  await prisma.task.deleteMany({});
  await prisma.weeklyReport.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Load users from Keycloak realm export if available
  const realmPath = path.join(__dirname, '../../../quatro5-realm.json');
  let usersToSeed: { id?: string; name: string; email: string; keycloak_id: string }[] = [];

  if (fs.existsSync(realmPath)) {
    console.log(`📖 Reading Keycloak realm file from: ${realmPath}`);
    try {
      const realmData = JSON.parse(fs.readFileSync(realmPath, 'utf-8'));
      const keycloakUsers = realmData.users || [];
      
      console.log(`Found ${keycloakUsers.length} users in Keycloak realm export.`);
      keycloakUsers.forEach((u: any) => {
        // Skip service accounts or system users if any
        if (u.username && !u.username.startsWith('service-account')) {
          const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
          usersToSeed.push({
            name,
            email: u.email || `${u.username}@example.com`,
            keycloak_id: u.id,
          });
        }
      });
    } catch (error) {
      console.error('Error parsing quatro5-realm.json:', error);
    }
  }

  // Fallback default users if no users found in JSON
  if (usersToSeed.length === 0) {
    console.log('⚠️ No users found in Keycloak realm file or file does not exist. Using fallback mock users.');
    usersToSeed = [
      {
        name: 'Gabriel Carvalho (Admin)',
        email: 'nascimentocarvalho894@gmail.com',
        keycloak_id: 'mock-admin-keycloak-id',
      },
      {
        name: 'Developer User',
        email: 'dev@gmail.com',
        keycloak_id: 'mock-dev-keycloak-id',
      },
    ];
  }

  // Create users in Database
  const createdUsers = [];
  for (const u of usersToSeed) {
    const dbUser = await prisma.user.create({
      data: {
        id: u.keycloak_id, // Map PostgreSQL User ID directly to Keycloak ID for seamless local dev sync
        name: u.name,
        email: u.email,
        password: '', // Password is managed by Keycloak
        keycloak_id: u.keycloak_id,
      },
    });
    createdUsers.push(dbUser);
    console.log(`Created user: ${dbUser.name} (${dbUser.email}) with ID: ${dbUser.id}`);
  }

  const primaryUser = createdUsers[0];
  const secondaryUser = createdUsers[1] || primaryUser;

  // 3. Create a closed WeeklyReport for the "previous week"
  console.log('📅 Seeding previous weekly report...');
  const lastWeekReport = await prisma.weeklyReport.create({
    data: {
      week_name: 'Semana Anterior - Ciclo Fechado',
      closed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      total_tasks: 3,
      completed_tasks: 3,
      total_score: 13,
      completed_score: 13,
    },
  });

  // Seed tasks that belong to this closed report
  const closedTasks = [
    {
      title: 'Configuração Inicial do Docker',
      description: 'Configurar PostgreSQL e Keycloak no docker-compose.yml',
      score: 5,
      status: TaskStatus.COMPLETED,
      assigned_to_id: primaryUser.id,
      created_by_id: primaryUser.id,
      due_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      weekly_report_id: lastWeekReport.id,
    },
    {
      title: 'Setup do Workspace com Lerna/Npm Workspaces',
      description: 'Inicializar monorepo e dependências de pacotes compartilhados',
      score: 3,
      status: TaskStatus.COMPLETED,
      assigned_to_id: secondaryUser.id,
      created_by_id: primaryUser.id,
      due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      weekly_report_id: lastWeekReport.id,
    },
    {
      title: 'Estruturação do Prisma Schema',
      description: 'Definir os modelos de dados iniciais e relações',
      score: 5,
      status: TaskStatus.COMPLETED,
      assigned_to_id: primaryUser.id,
      created_by_id: primaryUser.id,
      due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      weekly_report_id: lastWeekReport.id,
    },
  ];

  for (const t of closedTasks) {
    await prisma.task.create({ data: t });
  }

  // 4. Create tasks for the CURRENT active week (weekly_report_id is null)
  console.log('📝 Seeding active tasks for the current cycle...');
  const activeTasks = [
    {
      title: 'Desenvolver Casos de Uso do Ciclo Semanal',
      description: 'Criar use cases e repositório para fechamento, listagem e detalhe de relatórios',
      score: 8,
      status: TaskStatus.COMPLETED,
      assigned_to_id: primaryUser.id,
      created_by_id: primaryUser.id,
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      completed_at: new Date(),
      weekly_report_id: null,
    },
    {
      title: 'Implementar Componentes de UI no Frontend',
      description: 'Construir modal de confirmação e dashboard responsivo',
      score: 3,
      status: TaskStatus.COMPLETED,
      assigned_to_id: primaryUser.id,
      created_by_id: primaryUser.id,
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      completed_at: new Date(),
      weekly_report_id: null,
    },
    {
      title: 'Refatorar Roteamento de API',
      description: 'Isolar endpoints de weekly-report em seu próprio arquivo de rotas',
      score: 2,
      status: TaskStatus.IN_REVIEW,
      assigned_to_id: secondaryUser.id,
      created_by_id: primaryUser.id,
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      completed_at: null,
      weekly_report_id: null,
    },
    {
      title: 'Corrigir Timestamps de Auditoria no Banco',
      description: 'Adicionar created_at, updated_at e deleted_at no modelo de relatórios semanais',
      score: 3,
      status: TaskStatus.IN_PROGRESS,
      assigned_to_id: primaryUser.id,
      created_by_id: primaryUser.id,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      completed_at: null,
      weekly_report_id: null,
    },
    {
      title: 'Escrever Testes E2E para a API',
      description: 'Criar suíte de testes ponta a ponta com jest ou supertest',
      score: 5,
      status: TaskStatus.TODO,
      assigned_to_id: secondaryUser.id,
      created_by_id: primaryUser.id,
      due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      completed_at: null,
      weekly_report_id: null,
    },
  ];

  for (const t of activeTasks) {
    await prisma.task.create({ data: t });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
