'use client';
import { Word } from '@/lib/vocabulary';
import { AppProgress } from '@/lib/progress';
import FlashcardCard from '@/components/FlashcardCard';

interface Props {
  words: Word[];
  progress: AppProgress;
  onUpdate: (p: AppProgress) => void;
  quizMode: boolean;
  speed: number;
  activeCategory: string;
  sectionStudied: number;
  sectionPct: number;
}

export default function FlashcardView({ words, progress, onUpdate, quizMode, speed, activeCategory, sectionStudied, sectionPct }: Props) {
  return (
    <>
      <div className="section-head">
        <div className="sec-tag">§A · {words.length} quick-fire cards</div>
        <h2>{activeCategory === 'all' ? 'All French Words' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</h2>
        <p>
          {quizMode
            ? 'Pick the correct English meaning. Your score is saved automatically.'
            : 'Tap a card to flip it. Core words, phrases and vocabulary — the French you must own.'}
        </p>
        <div className="section-progress">
          <div className="sp-track"><div className="sp-fill" style={{ width: `${sectionPct}%` }} /></div>
          <div className="sp-text">{sectionStudied} / {words.length} studied</div>
        </div>
      </div>

      {words.length === 0 ? (
        <div className="no-results">
          <div className="big">Nothing matches.</div>
          <div>Try a different word or category.</div>
        </div>
      ) : (
        <div className="flash-grid">
          {words.map((word, i) => (
            <FlashcardCard
              key={word.id}
              word={word}
              index={i}
              total={words.length}
              progress={progress}
              onUpdate={onUpdate}
              quizMode={quizMode}
              speed={speed}
            />
          ))}
        </div>
      )}
    </>
  );
}
