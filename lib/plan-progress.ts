import type { Step } from './bereg.ts';

export function getPlanProgress(plan: Step[], completedSteps: string[]) {
  const completed = plan.filter(step => completedSteps.includes(step.id)).map(step => step.id);
  const total = plan.length;
  const count = completed.length;
  const nextStep = plan.find(step => !completed.includes(step.id)) ?? null;
  const message = count === 0
    ? 'Не нужно делать всё сразу. Начните с одного посильного шага.'
    : count === total
      ? 'Вы отметили все шаги плана. Можно сделать паузу и вернуться к материалам, когда понадобится.'
      : count === 1
        ? 'Первый шаг уже позади. Дальше можно двигаться в своём темпе.'
        : 'Вы уже сделали важное. Каждый следующий шаг можно пройти, когда будете готовы.';
  return { completed, total, count, nextStep, percent: total ? Math.round(count / total * 100) : 0, message };
}
