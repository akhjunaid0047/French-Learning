'use client';
import { useState } from 'react';
import { Word } from '@/lib/vocabulary';
import { AppProgress, updateWordProgress } from '@/lib/progress';
import { speakFrench as speak } from '@/lib/speech';
import { CheckIcon, ChevronIcon } from '@/components/icons';

interface Props {
  word: Word;
  index: number;
  progress: AppProgress;
  onUpdate: (p: AppProgress) => void;
  speed: number;
}

export default function QACard({ word, index, progress, onUpdate, speed }: Props) {
  const [open, setOpen] = useState(false);
  const isStudied = progress.words[word.id]?.known ?? false;
  const wp = progress.words[word.id];

  const markStudied = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(updateWordProgress(progress, word.id, !isStudied));
  };

  return (
    <article className={`qa-card${isStudied ? ' studied' : ''}${open ? ' open' : ''}`} data-key={`qa-${word.id}`}>
      <div className="qa-head" onClick={() => setOpen((o) => !o)}>
        <div className="qa-index">{index + 1}</div>
        <div className="qa-q">
          {word.french}
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', letterSpacing: '.12em', textTransform: 'uppercase', marginLeft: '10px', color: 'var(--rust)', fontWeight: 400 }}>
            {word.level}
          </span>
        </div>
        <ChevronIcon />
      </div>
      <div className="qa-body" style={{ maxHeight: open ? '500px' : '0' }}>
        <div className="qa-body-inner">
          <div className="qa-answer">
            <p><strong>{word.french}</strong> — {word.english}</p>
            {word.example && <p><em>Example: "{word.example}"</em></p>}
            <p>
              <button
                style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', padding: '6px 12px', border: '1.5px solid var(--line)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', color: 'var(--ink-soft)', marginTop: '8px' }}
                onClick={() => speak(word.french, speed)}
              >🔊 Listen to pronunciation</button>
            </p>
            {wp && (wp.correct > 0 || wp.incorrect > 0) && (
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: 'var(--ink-soft)', marginTop: '8px' }}>
                Score: <strong style={{ color: 'var(--good)' }}>✓ {wp.correct}</strong> correct · <strong style={{ color: 'var(--rust)' }}>✗ {wp.incorrect}</strong> wrong
              </p>
            )}
          </div>
          <div className="qa-foot">
            <span className="tag-pill">{word.category}</span>
            <button className="studied-toggle" onClick={markStudied}>
              <CheckIcon /> <span>{isStudied ? 'studied ✓' : 'mark studied'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
