export function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
      <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-md border border-border">
        <h1 className="text-3xl font-bold text-primary mb-4">Gestão Quatro5</h1>
        <p className="text-muted-foreground mb-6">
          Estrutura inicial criada com sucesso! Monorepo pronto com suporte a TypeScript, React, Tailwind v4, Node.js (Fastify) e Prisma.
        </p>
        <div className="flex gap-4">
          <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
            Front-end (Vite)
          </span>
          <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
            Back-end (Fastify)
          </span>
        </div>
      </div>
    </div>
  );
}
