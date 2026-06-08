export interface WordProgress {
  wordId: number;
  known: boolean;
  streak: number;
  lastSeen: number;
  correct: number;
  incorrect: number;
}

export interface AppProgress {
  words: Record<number, WordProgress>;
  totalStudied: number;
  dailyStreak: number;
  lastStudyDate: string;
  xp: number;
  level: number;
}

const STORAGE_KEY = 'french_flashcards_progress';

export function loadProgress(): AppProgress {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      // Merge with defaults so any fields added in newer versions don't become undefined
      return { ...defaultProgress(), ...JSON.parse(raw) };
    }
  } catch { /* ignore corrupt data */ }
  return defaultProgress();
}

export function saveProgress(progress: AppProgress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function defaultProgress(): AppProgress {
  return { words: {}, totalStudied: 0, dailyStreak: 0, lastStudyDate: '', xp: 0, level: 1 };
}

export function updateWordProgress(
  progress: AppProgress,
  wordId: number,
  correct: boolean
): AppProgress {
  const existing = progress.words[wordId] || {
    wordId, known: false, streak: 0, lastSeen: 0, correct: 0, incorrect: 0
  };
  const updated: WordProgress = {
    ...existing,
    streak: correct ? existing.streak + 1 : 0,
    known: correct && existing.streak >= 2,
    lastSeen: Date.now(),
    correct: existing.correct + (correct ? 1 : 0),
    incorrect: existing.incorrect + (correct ? 0 : 1),
  };
  const xpGain = correct ? (updated.streak > 1 ? 15 : 10) : 2;
  const newXp = progress.xp + xpGain;
  return {
    ...progress,
    words: { ...progress.words, [wordId]: updated },
    totalStudied: progress.totalStudied + 1,
    xp: newXp,
    level: Math.floor(newXp / 200) + 1,
  };
}

export function checkDailyStreak(progress: AppProgress): AppProgress {
  const today = new Date().toDateString();
  if (progress.lastStudyDate === today) return progress;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  return {
    ...progress,
    dailyStreak: progress.lastStudyDate === yesterday ? progress.dailyStreak + 1 : 1,
    lastStudyDate: today,
  };
}
