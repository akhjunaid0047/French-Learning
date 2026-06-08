'use client';
import { Word } from '@/lib/vocabulary';
import { AppProgress } from '@/lib/progress';
import QACard from '@/components/QACard';

interface Props {
  words: Word[];
  progress: AppProgress;
  onUpdate: (p: AppProgress) => void;
  speed: number;
  activeCategory: string;
  sectionStudied: number;
  sectionPct: number;
  startIndex?: number;
  totalFiltered?: number;
}

export default function BrowseView({ words, progress, onUpdate, speed, activeCategory, sectionStudied, sectionPct, startIndex, totalFiltered }: Props) {
  return (
    <>
      <div className="section-head">
        <div className="sec-tag">§B · {totalFiltered ?? words.length} words</div>
        <h2>
          {activeCategory === 'all'
            ? 'Browse & Review'
            : `Browse — ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
        </h2>
        <p>Expand a card for the meaning, example sentence and pronunciation. Mark each word as studied when you know it.</p>
        <div className="section-progress">
          <div className="sp-track"><div className="sp-fill" style={{ width: `${sectionPct}%` }} /></div>
          <div className="sp-text">{sectionStudied} / {totalFiltered ?? words.length} studied</div>
        </div>
      </div>

      {words.length === 0 ? (
        <div className="no-results">
          <div className="big">Nothing matches.</div>
          <div>Try a different word or category.</div>
        </div>
      ) : (
        <div className="qa-list">
          {words.map((word, i) => (
            <QACard
              key={word.id}
              word={word}
              index={(startIndex ?? 0) + i}
              progress={progress}
              onUpdate={onUpdate}
              speed={speed}
            />
          ))}
        </div>
      )}
    </>
  );
}
