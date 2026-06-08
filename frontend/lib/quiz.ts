/** Shared quiz utilities — used by FlashcardView and QuizView */

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildChoices(
  correct: { id: number; english: string },
  pool: { id: number; english: string }[]
): string[] {
  const others = shuffle(pool.filter((w) => w.id !== correct.id))
    .slice(0, 3)
    .map((w) => w.english);
  return shuffle([correct.english, ...others]);
}
