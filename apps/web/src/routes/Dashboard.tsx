import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/auth-store';
import { authApi } from '../features/auth/api/auth-api';
import { tasksApi } from '../features/tasks/api/tasks-api';
import type { Task, TaskStatus } from '../features/tasks/types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  LogOut,
  ListTodo,
  User,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Kanban,
  UserCheck,
  Award,
  Clock,
  CheckCircle,
  FileText,
  Inbox
} from 'lucide-react';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'TODO', label: 'A Fazer', color: 'border-t-slate-400' },
  { id: 'IN_PROGRESS', label: 'Em Desenvolvimento', color: 'border-t-slate-500' },
  { id: 'IN_REVIEW', label: 'Em Revisão', color: 'border-t-amber-600/70' },
  { id: 'COMPLETED', label: 'Concluído', color: 'border-t-emerald-600/70' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user, refreshToken, clearAuth } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks'>('tasks');

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [score, setScore] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [unassigned, assigned] = await Promise.all([
        tasksApi.list(),
        tasksApi.listByUser(user.id),
      ]);
      // Remove duplicates just in case, though they shouldn't overlap
      const allTasks = [...unassigned, ...assigned];
      const uniqueTasks = allTasks.filter(
        (task, index, self) => self.findIndex((t) => t.id === task.id) === index
      );
      setTasks(uniqueTasks);
    } catch (error) {
      console.error('Fetch tasks error:', error);
      toast.error('Erro ao buscar as tarefas do servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleLogout = async () => {
    if (!refreshToken) {
      clearAuth();
      navigate('/login');
      return;
    }

    setIsLoggingOut(true);
    try {
      await authApi.logout(refreshToken);
      toast.success('Sessão encerrada com sucesso.');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao encerrar sessão no Keycloak, limpando dados locais.');
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      navigate('/login');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('O título da tarefa é obrigatório.');
      return;
    }
    if (score < 0) {
      toast.error('A pontuação não pode ser negativa.');
      return;
    }
    if (!user) return;

    setIsCreating(true);
    try {
      const newTask = await tasksApi.create({
        title,
        description: description || undefined,
        score,
        created_by_id: user.id,
      });
      setTasks((prev) => [newTask, ...prev]);
      toast.success('Tarefa criada com sucesso!');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setScore(1);
    } catch (error: any) {
      console.error('Create task error:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar tarefa.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (!user) return;
    try {
      const updated = await tasksApi.update(taskId, {
        status: newStatus,
        assigned_to_id: newStatus === 'TODO' ? null : user.id,
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      toast.success(`Tarefa movida para "${COLUMNS.find((c) => c.id === newStatus)?.label}"`);
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Erro ao atualizar status da tarefa.');
    }
  };

  const handleAssignToMe = async (taskId: string) => {
    if (!user) return;
    try {
      const updated = await tasksApi.update(taskId, { assigned_to_id: user.id });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      toast.success('Tarefa atribuída a você com sucesso!');
    } catch (error) {
      console.error('Assign task error:', error);
      toast.error('Erro ao atribuir tarefa.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Deseja realmente excluir esta tarefa? (Soft delete)')) return;
    try {
      await tasksApi.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Tarefa excluída com sucesso.');
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error('Erro ao excluir tarefa.');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    const task = tasks.find((t) => t.id === draggedTaskId);
    if (task && task.status !== status) {
      await handleUpdateStatus(draggedTaskId, status);
    }
    setDraggedTaskId(null);
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const totalScore = tasks.reduce((acc, t) => acc + t.score, 0);
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewCount = tasks.filter((t) => t.status === 'IN_REVIEW').length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col select-none">
      {/* Header / Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center">
                <ListTodo className="w-4 h-4 text-slate-800" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                Gestão <span className="text-[#C2410C]">Quatro5</span>
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-0.5 rounded-sm border border-slate-200">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'bg-white text-slate-900 border border-slate-200/80 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Tarefas</span>
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-slate-900 border border-slate-200/80 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">{user.name}</span>
              <span className="text-[10px] text-slate-500">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-slate-200 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-all duration-150"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Subheader / Tabs for Mobile */}
      <div className="flex md:hidden border-b border-slate-200 bg-white p-1 justify-around">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'tasks' ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500'
          }`}
        >
          <Kanban className="w-3.5 h-3.5" />
          <span>Tarefas</span>
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'dashboard' ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' ? (
          /* DASHBOARD TAB - SaaS Metrics Overview */
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Painel de Indicadores</h1>
              <p className="text-xs text-slate-500">
                Visão geral baseada em dados e indicadores para acompanhamento das metas do time.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total de Tarefas</span>
                  <span className="text-xl font-bold text-slate-800">{totalTasks}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Pontuação Total (Score)</span>
                  <span className="text-xl font-bold text-slate-800">{totalScore} <span className="text-xs font-normal text-slate-500">pts</span></span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Em Execução</span>
                  <span className="text-xl font-bold text-slate-800">{inProgressCount + inReviewCount}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Concluídas</span>
                  <span className="text-xl font-bold text-slate-800">{completedCount}</span>
                </div>
              </div>
            </div>

            {/* Empty States / Information panel */}
            <div className="bg-white p-8 rounded-sm border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-sm bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Gráficos e Métricas Avançadas</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Em breve, esta tela exibirá gráficos de velocidade, burndown e distribuição de score por funcionário para ajudar o gestor Ricardo na tomada de decisão.
              </p>
              <button
                onClick={() => setActiveTab('tasks')}
                className="px-3.5 py-2 bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-semibold rounded-sm transition cursor-pointer"
              >
                Ir para o Quadro de Tarefas
              </button>
            </div>
          </div>
        ) : (
          /* KANBAN BOARD TAB */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Quadro de Tarefas</h1>
                <p className="text-xs text-slate-500">
                  Crie, acompanhe e mova suas tarefas pelas etapas do fluxo de trabalho.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-semibold rounded-sm shadow-sm cursor-pointer transition-all duration-150"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Tarefa</span>
              </button>
            </div>

            {/* Kanban Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {COLUMNS.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.id);
                const columnScore = columnTasks.reduce((acc, t) => acc + t.score, 0);

                return (
                  <div
                    key={col.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`bg-slate-50 rounded-sm border-t-[3px] border border-slate-200 flex flex-col min-h-[520px] ${col.color}`}
                  >
                    {/* Column Header */}
                    <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-100/60">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                        {col.label}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {columnTasks.length} • {columnScore} pts
                      </span>
                    </div>

                    {/* Column Content */}
                    <div className="flex-1 p-2 space-y-2.5 custom-scrollbar overflow-y-auto max-h-[62vh]">
                      {isLoading ? (
                        <div className="py-8 text-center text-xs text-slate-400">Carregando...</div>
                      ) : columnTasks.length === 0 ? (
                        <div className="py-10 text-center border border-slate-200 bg-white/40 rounded-sm flex flex-col items-center justify-center gap-1.5">
                          <Inbox className="w-5 h-5 text-slate-300" />
                          <span className="text-[10px] text-slate-400 font-medium">Nenhuma tarefa aqui</span>
                        </div>
                      ) : (
                        columnTasks.map((task) => {
                          const isAssignedToCurrentUser = task.assigned_to_id === user.id;

                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={() => handleDragStart(task.id)}
                              className="bg-white p-3.5 rounded-sm border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all duration-150 cursor-grab active:cursor-grabbing group relative space-y-2"
                            >
                              {/* Task Card Header */}
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-semibold text-xs leading-snug text-slate-800 break-words flex-1">
                                  {task.title}
                                </h3>
                                <span className="bg-slate-50 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded-sm border border-slate-200 shrink-0">
                                  {task.score} pts
                                </span>
                              </div>

                              {/* Task Description */}
                              {task.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                                  {task.description}
                                </p>
                              )}

                              {/* Footer Actions / Assignee */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                                <div className="flex items-center gap-1 text-slate-500">
                                  {task.assigned_to_id ? (
                                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                                      <UserCheck className="w-3 h-3 text-emerald-600" />
                                      <span>
                                        {isAssignedToCurrentUser ? 'Minha' : 'Atribuída'}
                                      </span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleAssignToMe(task.id)}
                                      className="text-[#C2410C] hover:underline font-bold cursor-pointer"
                                    >
                                      Atribuir a mim
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                  {/* Left Move button */}
                                  {col.id !== 'TODO' && (
                                    <button
                                      onClick={() => {
                                        const prevIndex = COLUMNS.findIndex((c) => c.id === col.id) - 1;
                                        handleUpdateStatus(task.id, COLUMNS[prevIndex].id);
                                      }}
                                      className="p-1 hover:bg-slate-100 rounded-sm text-slate-500 hover:text-slate-800 cursor-pointer"
                                      title="Mover para coluna anterior"
                                    >
                                      <ChevronLeft className="w-3 h-3" />
                                    </button>
                                  )}

                                  {/* Right Move button */}
                                  {col.id !== 'COMPLETED' && (
                                    <button
                                      onClick={() => {
                                        const nextIndex = COLUMNS.findIndex((c) => c.id === col.id) + 1;
                                        handleUpdateStatus(task.id, COLUMNS[nextIndex].id);
                                      }}
                                      className="p-1 hover:bg-slate-100 rounded-sm text-slate-500 hover:text-slate-800 cursor-pointer"
                                      title="Mover para próxima coluna"
                                    >
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  )}

                                  {/* Delete button */}
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-1 hover:bg-red-50 rounded-sm text-slate-400 hover:text-red-600 cursor-pointer ml-1"
                                    title="Excluir tarefa"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* CREATE TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-sm border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-sm font-bold text-slate-800">Criar Nova Tarefa</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Título
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Desenhar mockups da dashboard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-sm text-xs bg-white focus:outline-none focus:border-slate-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Descrição
                </label>
                <textarea
                  placeholder="Detalhamento das etapas necessárias para realizar a tarefa..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-sm text-xs bg-white focus:outline-none focus:border-slate-400 transition resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Pontuação (Score)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-sm text-xs bg-white focus:outline-none focus:border-slate-400 transition"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold border border-slate-200 rounded-sm hover:bg-slate-50 cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2 text-xs font-semibold bg-[#1E293B] hover:bg-[#334155] text-white rounded-sm disabled:opacity-50 cursor-pointer transition"
                >
                  {isCreating ? 'Criando...' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
