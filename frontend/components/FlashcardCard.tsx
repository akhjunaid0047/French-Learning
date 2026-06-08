'use client';
import { useState, useEffect } from 'react';
import { Word, vocabulary } from '@/lib/vocabulary';
import { AppProgress, updateWordProgress } from '@/lib/progress';
import { speakFrench as speak } from '@/lib/speech';
import { buildChoices } from '@/lib/quiz';
import { CheckIcon, FlipIcon } from '@/components/icons';

interface Props {
  word: Word;
  index: number;
  total: number;
  progress: AppProgress;
  onUpdate: (p: AppProgress) => void;
  quizMode: boolean;
  speed: number;
}

export default function FlashcardCard({ word, index, total, progress, onUpdate, quizMode, speed }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const isStudied = progress.words[word.id]?.known ?? false;

  useEffect(() => {
    setFlipped(false);
    setChosen(null);
    if (quizMode) setChoices(buildChoices(word, vocabulary));
  }, [word.id, quizMode]);

  const handleFlip = () => {
    if (!quizMode) {
      setFlipped((f) => !f);
      if (!flipped) speak(word.french, speed);
    }
  };

  const markStudied = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(updateWordProgress(progress, word.id, !isStudied));
  };

  const pickAnswer = (e: React.MouseEvent, choice: string) => {
    e.stopPropagation();
    if (chosen) return;
    setChosen(choice);
    speak(word.french, speed);
    onUpdate(updateWordProgress(progress, word.id, choice === word.english));
  };

  return (
    <div className={`flashcard${quizMode ? ' quiz-mode' : ''}${isStudied ? ' studied' : ''}${flipped ? ' flipped' : ''}`} onClick={handleFlip}>
      <div className="flash-inner">
        {/* Front */}
        <div className="flash-face flash-front">
          <div className="flash-studied-mark" title="mark as studied" onClick={markStudied}>
            {isStudied && <CheckIcon />}
          </div>
          <div className="flash-num">№ {String(index + 1).padStart(2, '0')} / {total}</div>
          <div className="flash-q">{word.french}</div>

          {quizMode && choices.length > 0 && (
            <div className="quiz-choices" onClick={(e) => e.stopPropagation()}>
              {choices.map((c, i) => {
                let cls = 'quiz-choice';
                if (chosen) {
                  if (c === word.english) cls += ' correct';
                  else if (c === chosen) cls += ' wrong';
                  else cls += ' dimmed';
                }
                return (
                  <button key={i} className={cls} disabled={!!chosen} onClick={(e) => pickAnswer(e, c)}>
                    {String.fromCharCode(65 + i)}. {c}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flash-hint">
            <FlipIcon />
            {quizMode ? 'pick the correct answer' : 'tap to flip'}
            {!quizMode && (
              <button
                style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 8px', border: '1px solid var(--line)', borderRadius: '5px', background: 'transparent', cursor: 'pointer', color: 'var(--ink-soft)' }}
                onClick={(e) => { e.stopPropagation(); speak(word.french, speed); }}
              >🔊 listen</button>
            )}
          </div>
        </div>

        {/* Back */}
        <div className="flash-face flash-back">
          <div className="flash-num">Answer · № {String(index + 1).padStart(2, '0')}</div>
          <div className="flash-a">
            <strong style={{ fontSize: '1.18rem' }}>{word.english}</strong>
            {word.example && <p style={{ marginTop: '8px', opacity: 0.8, fontStyle: 'italic', fontSize: '0.9rem' }}>"{word.example}"</p>}
          </div>
          <div className="flash-hint">
            <FlipIcon />
            tap card · ◯ corner = studied
            <button
              style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 8px', border: '1px solid rgba(243,237,224,.3)', borderRadius: '5px', background: 'transparent', cursor: 'pointer', color: 'rgba(243,237,224,.7)' }}
              onClick={(e) => { e.stopPropagation(); speak(word.french, speed); }}
            >🔊 listen</button>
          </div>
        </div>
      </div>
    </div>
  );
}
