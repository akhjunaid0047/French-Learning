import rawData from '../french1000.json';

export interface Word {
  id: number;
  french: string;
  english: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  category: string;
  example?: string;
}

function assertVocabulary(data: unknown): Word[] {
  if (!Array.isArray(data)) {
    throw new Error('Vocabulary data must be an array.');
  }

  const words = data as Word[];
  const idSet = new Set<number>();
  const frenchSet = new Set<string>();

  for (const word of words) {
    if (
      typeof word.id !== 'number' ||
      typeof word.french !== 'string' ||
      typeof word.english !== 'string' ||
      typeof word.level !== 'string' ||
      typeof word.category !== 'string'
    ) {
      throw new Error('Vocabulary data contains an invalid entry shape.');
    }

    if (/_\d+$/.test(word.french)) {
      throw new Error(`Placeholder vocabulary entry detected: ${word.french}`);
    }

    if (idSet.has(word.id)) {
      throw new Error(`Duplicate vocabulary id detected: ${word.id}`);
    }

    const normalizedFrench = word.french.trim().toLowerCase();
    if (frenchSet.has(normalizedFrench)) {
      throw new Error(`Duplicate French vocabulary entry detected: ${word.french}`);
    }

    idSet.add(word.id);
    frenchSet.add(normalizedFrench);
  }

  if (words.length < 1000) {
    throw new Error(`Expected at least 1000 vocabulary entries, received ${words.length}.`);
  }

  return words;
}

let _vocabulary: Word[] = [];
try {
  _vocabulary = assertVocabulary(rawData);
} catch (err) {
  console.error('[vocabulary] Failed to load vocabulary data:', err);
  // App will show empty state rather than crashing
}
export const vocabulary: Word[] = _vocabulary;

export const categories = [...new Set(vocabulary.map((w) => w.category))];
export const levels = ['A1', 'A2', 'B1', 'B2'] as const;
