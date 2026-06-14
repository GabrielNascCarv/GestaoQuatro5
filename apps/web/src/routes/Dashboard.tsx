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
  Inbox,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar
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
  const [score, setScore] = useState<number | ''>(1);
  const [dueDate, setDueDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Metrics State
  const [metrics, setMetrics] = useState<any | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);

  // Weekly Reports State
  const [weeklyReports, setWeeklyReports] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('current');
  const [selectedReportDetail, setSelectedReportDetail] = useState<any | null>(null);
  const [isReportsLoading, setIsReportsLoading] = useState(false);
  const [isClosingWeek, setIsClosingWeek] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Task Detail Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

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

  const fetchMetrics = async () => {
    setIsMetricsLoading(true);
    try {
      const data = await tasksApi.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Fetch metrics error:', error);
      toast.error('Erro ao buscar os indicadores da dashboard.');
    } finally {
      setIsMetricsLoading(false);
    }
  };

  const fetchWeeklyReports = async () => {
    setIsReportsLoading(true);
    try {
      const reports = await tasksApi.listWeeklyReports();
      setWeeklyReports(reports);
    } catch (error) {
      console.error('Fetch weekly reports error:', error);
      toast.error('Erro ao buscar o histórico de fechamentos.');
    } finally {
      setIsReportsLoading(false);
    }
  };

  const fetchReportDetail = async (id: string) => {
    if (id === 'current') {
      setSelectedReportDetail(null);
      fetchMetrics();
      return;
    }
    setIsReportsLoading(true);
    try {
      const detail = await tasksApi.getWeeklyReport(id);
      setSelectedReportDetail(detail);
    } catch (error) {
      console.error('Fetch report detail error:', error);
      toast.error('Erro ao obter detalhes do relatório semanal.');
    } finally {
      setIsReportsLoading(false);
    }
  };

  const confirmCloseWeek = async () => {
    setIsClosingWeek(true);
    setShowCloseConfirm(false);
    try {
      console.log('Sending closeWeek request to backend...');
      const report = await tasksApi.closeWeek();
      console.log('closeWeek response:', report);
      toast.success(`Semana fechada com sucesso: ${report.week_name}`);
      await Promise.all([
        fetchTasks(),
        fetchMetrics(),
        fetchWeeklyReports(),
      ]);
      setSelectedReportId('current');
    } catch (error: any) {
      console.error('Close week error:', error);
      toast.error(error.response?.data?.message || 'Erro ao realizar o fechamento da semana.');
    } finally {
      setIsClosingWeek(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const isAdmin = user?.roles?.includes('admin');

  useEffect(() => {
    if (activeTab === 'dashboard' && isAdmin) {
      fetchMetrics();
      fetchWeeklyReports();
      setSelectedReportId('current');
      setSelectedReportDetail(null);
    }
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (activeTab === 'dashboard' && isAdmin && selectedReportId) {
      fetchReportDetail(selectedReportId);
    }
  }, [selectedReportId, activeTab, isAdmin]);

  useEffect(() => {
    if (!isAdmin && activeTab === 'dashboard') {
      setActiveTab('tasks');
    }
  }, [isAdmin, activeTab]);

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
    const parsedScore = score === '' ? 0 : Number(score);
    if (parsedScore < 0) {
      toast.error('A pontuação não pode ser negativa.');
      return;
    }
    if (!user) return;

    setIsCreating(true);
    try {
      const newTask = await tasksApi.create({
        title,
        description: description || undefined,
        score: parsedScore,
        created_by_id: user.id,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });
      setTasks((prev) => [newTask, ...prev]);
      toast.success('Tarefa criada com sucesso!');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setScore(1);
      setDueDate('');
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

  const getUserDetails = (userId: string | null) => {
    if (!userId) return null;
    const match = metrics?.workload?.find((w: any) => w.userId === userId);
    if (match) {
      return { name: match.userName, email: match.userEmail };
    }
    if (user && userId === user.id) {
      return { name: user.name || '', email: user.email || '' };
    }
    return null;
  };

  const handleOpenDetail = async (taskId: string) => {
    setIsDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const taskData = await tasksApi.getById(taskId);
      setSelectedTask(taskData);
    } catch (error) {
      console.error('Fetch task detail error:', error);
      toast.error('Erro ao buscar detalhes da tarefa.');
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
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
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col select-none">
      {/* Header / Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div
              onClick={activeTab === 'dashboard' ? () => setActiveTab('tasks') : undefined}
              className={`flex items-center gap-2 ${activeTab === 'dashboard' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            >
              <div className="w-8 h-8 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center">
                <ListTodo className="w-4 h-4 text-slate-800" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                Gestão <span className="text-[#C2410C]">Quatro5</span>
              </span>
            </div>

            {/* Navigation Tabs */}
            {isAdmin && (
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
            )}
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
      {isAdmin && (
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
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' ? (
          (isMetricsLoading && !metrics) || isReportsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin" />
              <span className="text-xs text-slate-500 font-medium animate-pulse">Carregando indicadores...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">Painel de Indicadores</h1>
                  <p className="text-xs text-slate-500">
                    Visão geral baseada em dados e indicadores para acompanhamento das metas do time.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedReportId}
                    onChange={(e) => setSelectedReportId(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                  >
                    <option value="current">Semana Atual (Ativa)</option>
                    {weeklyReports.map((report) => (
                      <option key={report.id} value={report.id}>
                        {report.week_name} ({new Date(report.closed_at).toLocaleDateString('pt-BR')})
                      </option>
                    ))}
                  </select>

                  {selectedReportId === 'current' && (
                    <button
                      onClick={() => setShowCloseConfirm(true)}
                      disabled={isClosingWeek || (metrics && metrics.flowStatus.COMPLETED === 0)}
                      title={metrics && metrics.flowStatus.COMPLETED === 0 ? "Nenhuma tarefa concluída para fechar a semana" : "Fechar semana e consolidar resultados"}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-sm shadow-xs transition cursor-pointer flex items-center gap-1.5 text-white ${
                        metrics && metrics.flowStatus.COMPLETED === 0
                          ? 'bg-slate-300 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isClosingWeek ? 'Fechando...' : 'Fechar Semana'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => selectedReportId === 'current' ? fetchMetrics() : fetchReportDetail(selectedReportId)}
                    disabled={isMetricsLoading || isReportsLoading}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-sm shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Clock className={`w-3.5 h-3.5 ${(isMetricsLoading || isReportsLoading) ? 'animate-spin' : ''}`} />
                    <span>{(isMetricsLoading || isReportsLoading) ? 'Atualizando...' : 'Atualizar'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Tasks Card */}
                <div className="bg-white p-4.5 rounded-sm border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-sm bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total de Tarefas</span>
                    <span className="text-lg font-bold text-slate-800">
                      {selectedReportDetail ? selectedReportDetail.total_tasks : (metrics ? (metrics.flowStatus.TODO + metrics.flowStatus.IN_PROGRESS + metrics.flowStatus.IN_REVIEW + metrics.flowStatus.COMPLETED) : totalTasks)}
                    </span>
                  </div>
                </div>

                {/* Total Score / Active Score Card */}
                <div className="bg-white p-4.5 rounded-sm border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-sm bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                    <Award className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      {selectedReportDetail ? 'Pontuação Total' : 'Pontos Ativos'}
                    </span>
                    <span className="text-lg font-bold text-slate-800">
                      {selectedReportDetail ? selectedReportDetail.total_score : (metrics ? metrics.workload.reduce((acc: number, w: any) => acc + w.totalScore, 0) : tasks.filter(t => t.status !== 'COMPLETED').reduce((acc, t) => acc + t.score, 0))} <span className="text-[10px] font-normal text-slate-500">pts</span>
                    </span>
                  </div>
                </div>

                {/* Deadlines At Risk / Completed Score Card */}
                <div className="bg-white p-4.5 rounded-sm border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-sm bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      {selectedReportDetail ? 'Pontos Entregues' : 'Prazos Críticos'}
                    </span>
                    <span className="text-lg font-bold text-slate-800">
                      {selectedReportDetail ? `${selectedReportDetail.completed_score} pts` : (metrics?.criticalDeadlines?.length ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Completed Tasks Card */}
                <div className="bg-white p-4.5 rounded-sm border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Concluídas</span>
                    <span className="text-lg font-bold text-slate-800">
                      {selectedReportDetail ? selectedReportDetail.completed_tasks : (metrics ? metrics.flowStatus.COMPLETED : completedCount)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedReportDetail ? (
                /* HISTORICAL REPORT VIEW */
                <div className="bg-white border border-slate-200 rounded-sm">
                  <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Relatório de Tarefas da Semana</h2>
                    <p className="text-[10px] text-slate-400">Detalhamento de todas as tarefas concluídas e arquivadas nesta semana.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          <th className="p-4">Tarefa</th>
                          <th className="p-4">Pontuação</th>
                          <th className="p-4">Responsável</th>
                          <th className="p-4">Data de Conclusão</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {selectedReportDetail.tasks && selectedReportDetail.tasks.length > 0 ? (
                          selectedReportDetail.tasks.map((task: any) => (
                            <tr key={task.id} className="hover:bg-slate-50/40 transition">
                              <td className="p-4 font-semibold text-slate-800">
                                {task.title}
                              </td>
                              <td className="p-4 text-slate-600 font-medium">
                                {task.score} pts
                              </td>
                              <td className="p-4">
                                {task.assigned_to ? (
                                  <div>
                                    <span className="font-semibold text-slate-700 block">{task.assigned_to.name}</span>
                                    <span className="text-[10px] text-slate-400">{task.assigned_to.email}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">Não designado</span>
                                )}
                              </td>
                              <td className="p-4 text-slate-500">
                                {task.completed_at ? new Date(task.completed_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'Não informado'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                              Nenhuma tarefa concluída nesta semana.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Main Grid: Workload Balancer & Side Cards */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* WORKLOAD BALANCER COLUMN */}
                  <div className="bg-white border border-slate-200 rounded-sm lg:col-span-2 flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Carga de Trabalho do Time</h2>
                      <p className="text-[10px] text-slate-400">Balanceamento de tarefas e pontos por colaborador ativo.</p>
                    </div>

                    <div className="p-4 flex-1 space-y-4">
                      {metrics?.workload && metrics.workload.length > 0 ? (
                        metrics.workload.map((member: any) => {
                          const maxCap = 15;
                          const activeScore = member.totalScore;
                          const percentage = Math.min((activeScore / maxCap) * 100, 100);
                          
                          let statusColor = 'bg-slate-500';
                          let statusLabel = 'Ocioso';
                          let statusBadge = 'bg-slate-100 text-slate-600 border-slate-200';
                          
                          if (activeScore > 15) {
                            statusColor = 'bg-rose-500';
                            statusLabel = 'Sobrecarregado';
                            statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                          } else if (activeScore >= 11) {
                            statusColor = 'bg-amber-500';
                            statusLabel = 'Alerta';
                            statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                          } else if (activeScore >= 1) {
                            statusColor = 'bg-emerald-500';
                            statusLabel = 'Ideal';
                            statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          }

                          return (
                            <div key={member.userId} className="p-3 border border-slate-100 rounded-sm hover:bg-slate-50/50 transition duration-150 space-y-2.5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                <div>
                                  <span className="text-xs font-bold text-slate-800 block">{member.userName}</span>
                                  <span className="text-[10px] text-slate-400">{member.userEmail}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${statusBadge}`}>
                                    {statusLabel}
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-700">
                                    {activeScore} <span className="text-[9px] font-normal text-slate-400">pts ativos</span>
                                  </span>
                                </div>
                              </div>

                              {/* Capacity bar */}
                              <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden">
                                <div className={`h-full ${statusColor} transition-all duration-300`} style={{ width: `${percentage}%` }} />
                              </div>

                              {/* Additional details */}
                              <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-0.5">
                                <div>
                                  Tarefas ativas: <span className="font-bold text-slate-700">{member.taskCount}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <div>
                                  Concluídas: <span className="font-bold text-slate-700">{member.completedTaskCount}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <div>
                                  Entregue: <span className="font-bold text-slate-700">{member.completedTotalScore} pts</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-12 text-center text-xs text-slate-400">Nenhum colaborador encontrado.</div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT SIDE DETAILS: VELOCITY & DEADLINES */}
                  <div className="space-y-6">
                    
                    {/* VELOCITY METRIC CARD */}
                    <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-4">
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Velocidade Semanal</h2>
                        <p className="text-[10px] text-slate-400">Pontuação entregue nos últimos 7 dias vs semana anterior.</p>
                      </div>

                      {metrics?.weeklyVelocity ? (() => {
                        const current = metrics.weeklyVelocity.currentWeekScore;
                        const previous = metrics.weeklyVelocity.previousWeekScore;
                        let diffPercent = 0;
                        let isTrendUp = true;
                        
                        if (previous > 0) {
                          diffPercent = Math.round(((current - previous) / previous) * 100);
                          isTrendUp = current >= previous;
                        } else if (current > 0) {
                          diffPercent = 100;
                          isTrendUp = true;
                        } else {
                          diffPercent = 0;
                          isTrendUp = true;
                        }

                        return (
                          <div className="space-y-4">
                            <div className="flex items-end justify-between">
                              <div>
                                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Velocidade Atual</span>
                                <span className="text-2xl font-black text-slate-800">{current} <span className="text-xs font-bold text-slate-400">pts</span></span>
                              </div>
                              
                              {diffPercent !== 0 ? (
                                <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-sm text-xs font-bold ${
                                  isTrendUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {isTrendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                  <span>{isTrendUp ? '+' : ''}{diffPercent}%</span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-sm">Sem variação</span>
                              )}
                            </div>

                            {/* Comparison Visualizer */}
                            <div className="space-y-2 pt-1">
                              <div className="space-y-1 text-[10px] text-slate-500">
                                <div className="flex justify-between">
                                  <span>Esta semana</span>
                                  <span className="font-bold text-slate-700">{current} pts</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(current * 4, 100)}%` }} />
                                </div>
                              </div>

                              <div className="space-y-1 text-[10px] text-slate-500">
                                <div className="flex justify-between">
                                  <span>Semana anterior</span>
                                  <span className="font-bold text-slate-700">{previous} pts</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                                  <div className="h-full bg-slate-400" style={{ width: `${Math.min(previous * 4, 100)}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="text-center text-xs text-slate-400">Calculando velocidade...</div>
                      )}
                    </div>

                    {/* CRITICAL DEADLINES CARD */}
                    <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-4">
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Prazos em Risco</h2>
                        <p className="text-[10px] text-slate-400">Tarefas não concluídas que venceram ou vencem em 48h.</p>
                      </div>

                      <div className="space-y-2.5 max-h-[350px] overflow-y-auto custom-scrollbar">
                        {metrics?.criticalDeadlines && metrics.criticalDeadlines.length > 0 ? (
                          metrics.criticalDeadlines.map((task: any) => {
                            const dueDateObj = new Date(task.due_date);
                            const isOverdue = dueDateObj < new Date();
                            
                            return (
                              <div
                                key={task.id}
                                onClick={() => handleOpenDetail(task.id)}
                                className="p-2.5 border border-rose-100 bg-rose-50/20 hover:bg-rose-50/50 hover:border-rose-200 transition-all duration-150 rounded-sm space-y-1 cursor-pointer"
                              >
                                <div className="flex justify-between gap-1.5">
                                  <span className="text-[11px] font-bold text-slate-800 break-words leading-tight flex-1">{task.title}</span>
                                  <span className="bg-white border border-rose-200 text-rose-800 text-[8px] font-bold px-1 rounded-sm shrink-0 self-start">{task.score} pts</span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-slate-500">
                                  <div className="flex items-center gap-0.5 font-bold text-rose-700">
                                    <Calendar className="w-3 h-3" />
                                    <span>Vence: {dueDateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                                  </div>
                                  <span className="text-slate-300">•</span>
                                  <div>
                                    Colaborador: <span className="font-semibold text-slate-600">{task.assigned_to?.name ?? 'Não atribuído'}</span>
                                  </div>
                                </div>

                                {isOverdue && (
                                  <div className="text-[8px] uppercase tracking-wider font-extrabold text-rose-600">
                                    Tarefa Atrasada!
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-6 text-center border border-dashed border-emerald-200 bg-emerald-50/20 rounded-sm flex flex-col items-center justify-center gap-1">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-[10px] text-emerald-800 font-bold">Excelente!</span>
                            <span className="text-[9px] text-emerald-600">Nenhum prazo crítico em risco.</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )
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
                              onClick={() => handleOpenDetail(task.id)}
                              className="bg-white p-3.5 rounded-sm border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group relative space-y-2"
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

                              {/* Task Due Date */}
                              {task.due_date && (
                                <div className={`flex items-center gap-1 text-[10px] ${
                                  new Date(task.due_date) < new Date() && task.status !== 'COMPLETED'
                                    ? 'text-red-600 font-semibold'
                                    : 'text-slate-500'
                                }`}>
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span>
                                    Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                  </span>
                                  {new Date(task.due_date) < new Date() && task.status !== 'COMPLETED' && (
                                    <span className="text-[8px] uppercase font-bold bg-red-50 text-red-600 px-1 rounded-sm border border-red-200">
                                      Atrasada
                                    </span>
                                  )}
                                </div>
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAssignToMe(task.id);
                                      }}
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
                                      onClick={(e) => {
                                        e.stopPropagation();
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
                                      onClick={(e) => {
                                        e.stopPropagation();
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTask(task.id);
                                    }}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setScore(val === '' ? '' : Number(val));
                  }}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-sm text-xs bg-white focus:outline-none focus:border-slate-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Prazo (Opcional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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

      {/* Close Week Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-md shadow-xl border border-slate-100 max-w-sm w-full mx-4 p-5 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-full text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Fechar Ciclo Semanal</h3>
                <p className="text-[10px] text-slate-500">Esta ação é irreversível.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Tem certeza de que deseja fechar a semana atual? Todas as tarefas na coluna <strong>Concluído</strong> serão consolidadas no relatório histórico e arquivadas.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-sm transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmCloseWeek}
                disabled={isClosingWeek}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-sm transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isClosingWeek ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Fechando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Sim, Fechar Semana</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK DETAIL MODAL */}
      {isDetailOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-sm border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-sm font-bold text-slate-800">Detalhes da Tarefa</h2>
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedTask(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {isDetailLoading || !selectedTask ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin" />
                <span className="text-[10px] text-slate-400 font-medium">Carregando detalhes...</span>
              </div>
            ) : (() => {
              const creator = getUserDetails(selectedTask.created_by_id);
              const assignee = getUserDetails(selectedTask.assigned_to_id);
              return (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{selectedTask.title}</h3>
                  </div>

                  {selectedTask.description && (
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-sm border border-slate-100 max-h-[150px] overflow-y-auto custom-scrollbar">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Descrição</span>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Status</span>
                      <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-sm border border-slate-200 uppercase text-[9px]">
                        {COLUMNS.find(c => c.id === selectedTask.status)?.label || selectedTask.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Pontuação</span>
                      <span className="inline-block bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-sm border border-amber-200 text-[9px]">
                        {selectedTask.score} pts
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Criador</span>
                      <div className="text-slate-700">
                        <span className="font-semibold block">{creator?.name || 'Carregando...'}</span>
                        <span className="text-[10px] text-slate-400">{creator?.email || ''}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Responsável</span>
                      {selectedTask.assigned_to_id ? (
                        <div className="text-slate-700">
                          <span className="font-semibold block">{assignee?.name || 'Carregando...'}</span>
                          <span className="text-[10px] text-slate-400">{assignee?.email || ''}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-slate-400 italic block mb-1">Não atribuída</span>
                          <button
                            onClick={() => {
                              handleAssignToMe(selectedTask.id);
                              // Sync locally in state
                              setSelectedTask({
                                ...selectedTask,
                                assigned_to_id: user.id
                              });
                            }}
                            className="bg-[#C2410C] hover:bg-[#A83707] text-white text-[9px] font-bold px-2 py-1 rounded-sm cursor-pointer transition"
                          >
                            Atribuir a mim
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                    {selectedTask.due_date && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Prazo de Entrega</span>
                        <span className="text-slate-600 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(selectedTask.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                      </div>
                    )}

                    {selectedTask.completed_at && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Concluída em</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          {new Date(selectedTask.completed_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsDetailOpen(false);
                        setSelectedTask(null);
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-sm transition cursor-pointer text-center"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
