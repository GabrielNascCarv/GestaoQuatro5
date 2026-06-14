import { prisma } from '@gestao-quatro5/database';
import { IGetTaskMetricsUseCase, TaskMetricsOutput } from '../../contracts/usecase/task/get-task-metrics-usecase';
import { TaskStatus } from '../../entities/task';
import { ITaskRepository } from '../../contracts/repository/task-repository';

export class GetTaskMetricsUseCase implements IGetTaskMetricsUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(): Promise<TaskMetricsOutput> {
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Fetch all users (excluding deleted ones)
    const users = await prisma.user.findMany({
      where: { deleted_at: null },
    });

    // Fetch all tasks (excluding deleted ones)
    const tasks = await prisma.task.findMany({
      where: { deleted_at: null },
      include: {
        assigned_to: true,
      },
    });

    // 1. flowStatus
    const flowStatus = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      COMPLETED: 0,
    };

    tasks.forEach((task) => {
      if (task.weekly_report_id === null && task.status in flowStatus) {
        flowStatus[task.status as TaskStatus]++;
      }
    });

    // 2. workload (active tasks, i.e., status is not COMPLETED)
    const workload = users.map((user) => {
      const activeTasks = tasks.filter(
        (t) => t.assigned_to_id === user.id && t.status !== 'COMPLETED' && t.weekly_report_id === null
      );
      const totalScore = activeTasks.reduce((sum, t) => sum + t.score, 0);

      const completedTasks = tasks.filter(
        (t) => t.assigned_to_id === user.id && t.status === 'COMPLETED' && t.weekly_report_id === null
      );
      const completedTotalScore = completedTasks.reduce((sum, t) => sum + t.score, 0);

      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        taskCount: activeTasks.length,
        totalScore,
        completedTaskCount: completedTasks.length,
        completedTotalScore,
      };
    });

    // Sort workload by totalScore (descending) to show overloaded users at the top
    workload.sort((a, b) => b.totalScore - a.totalScore);

    // 3. criticalDeadlines (non-completed tasks that are overdue or due within 48h)
    const criticalTasks = tasks.filter((task) => {
      if (task.status === 'COMPLETED' || !task.due_date || task.weekly_report_id !== null) return false;
      const dueDate = new Date(task.due_date);
      return dueDate <= fortyEightHoursFromNow;
    });

    const criticalDeadlines = criticalTasks.map((task) => ({
      id: task.id,
      title: task.title,
      score: task.score,
      status: task.status as TaskStatus,
      due_date: task.due_date!,
      assigned_to: task.assigned_to
        ? {
            id: task.assigned_to.id,
            name: task.assigned_to.name,
            email: task.assigned_to.email,
          }
        : null,
    }));

    // Sort critical deadlines by due_date (ascending) to show most urgent tasks first
    criticalDeadlines.sort((a, b) => a.due_date.getTime() - b.due_date.getTime());

    // 4. weeklyVelocity (completed tasks score in current week vs previous week)
    let currentWeekScore = 0;
    let previousWeekScore = 0;

    tasks.forEach((task) => {
      if (task.status === 'COMPLETED' && task.completed_at) {
        const completedDate = new Date(task.completed_at);
        if (completedDate >= sevenDaysAgo && completedDate <= now) {
          currentWeekScore += task.score;
        } else if (completedDate >= fourteenDaysAgo && completedDate < sevenDaysAgo) {
          previousWeekScore += task.score;
        }
      }
    });

    return {
      flowStatus,
      workload,
      criticalDeadlines,
      weeklyVelocity: {
        currentWeekScore,
        previousWeekScore,
      },
    };
  }
}
