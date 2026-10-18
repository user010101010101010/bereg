import type { Step } from './bereg.ts';

export function getPlanProgress(plan: Step[], completedSteps: string[]) {
  const completed = plan.filter(step => completedSteps.includes(step.id)).map(step => step.id);
  const total = plan.length;
  const count = completed.length;
  const nextStep = plan.find(step => !completed.includes(step.id)) ?? null;
  const message = count === total ? 'Все задачи отмечены. Инструкции и документы доступны в «Моём случае».' : `Осталось задач: ${total-count}. Отметки можно изменить.`;
  return { completed, total, count, nextStep, percent: total ? Math.round(count / total * 100) : 0, message };
}
