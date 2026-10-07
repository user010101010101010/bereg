import { z } from 'zod';
import { choices, generatePlan, type Answers, type SavedCase } from './bereg';

// Each GitHub Pages project has its own record, including on a shared origin.
const storageKey = () => `bereg:case:v1:${new URL('.', window.location.href).pathname}`;
const choice = (key: keyof typeof choices) => z.string().refine(value => choices[key].some(([id]) => id === value));
const payloadSchema = z.object({
  answers: z.object({risk:choice('risk'),timing:choice('timing'),kind:choice('kind'),money:choice('money'),impact:choice('impact'),amount:choice('amount'),already:z.array(choice('already')).max(4),mood:choice('mood'),support:choice('support'),notes:z.string().max(4000)}).strict(),
  documents: z.record(z.enum(['bank','police']), z.string().max(12000)),
  focusStep: z.string().max(40).nullable(),
});
const storedSchema = payloadSchema.extend({id:z.string(),updatedAt:z.string().datetime()});
type CaseInput = Pick<SavedCase,'answers'|'documents'|'focusStep'>;
function validateFocus(data: CaseInput) {
  if (data.focusStep && !generatePlan(data.answers).some(step => step.id === data.focusStep)) throw new Error('Этот шаг не входит в ваш план.');
}
export function loadLocalCase(): SavedCase | null {
  let raw: string | null;
  try { raw = window.localStorage.getItem(storageKey()); }
  catch { throw new Error('Браузер запрещает сохранение. План и черновики можно скачать.'); }
  if (!raw) return null;
  try {
    const value = storedSchema.parse(JSON.parse(raw)) as SavedCase;
    validateFocus(value);
    return value;
  } catch { throw new Error('Сохранение повреждено. Его можно удалить и сохранить случай заново.'); }
}
export function saveLocalCase(input: CaseInput): SavedCase {
  const data = payloadSchema.parse(input) as CaseInput;
  validateFocus(data);
  const value: SavedCase = {...data, id:crypto.randomUUID(), updatedAt:new Date().toISOString()};
  try { window.localStorage.setItem(storageKey(),JSON.stringify(value)); }
  catch { throw new Error('Браузер не смог сохранить данные. Скачайте план и черновики или разрешите хранение данных сайта.'); }
  return value;
}
export function removeLocalCase() { window.localStorage.removeItem(storageKey()); }
