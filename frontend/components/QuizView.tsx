'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Word } from '@/lib/vocabulary';
import { AppProgress, updateWordProgress } from '@/lib/progress';
import { speakFrench as speak } from '@/lib/speech';
import { shuffle, buildChoices } from '@/lib/quiz';

interface QuizQuestion { word: Word; choices: string[]; }

interface Props {
  words: Word[];
  allWords: Word[];
  progress: AppProgress;
  onUpdate: (p: AppProgress) => void;
  onBack: () => void;
  speed: number;
}

export default function QuizView({ words, allWords, progress, onUpdate, onBack, speed }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<{ word: Word; chosen: string }[]>([]);
  const [timer, setTimer] = useState(15);
  const timerActiveRef = useRef(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [started, setStarted] = useState(false);

  const startQuiz = useCallback(() => {
    const pool = allWords.length >= 4 ? allWords : words;
    const qs = shuffle(words)
      .slice(0, Math.min(questionCount, words.length))
      .map((w) => ({ word: w, choices: buildChoices(w, pool) }));
    setQuestions(qs);
    setQi(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setWrongAnswers([]);
    setTimer(15);
    timerActiveRef.current = true;
    setStarted(true);
  }, [words, allWords, questionCount]);

  // Timer — uses ref to avoid stale-closure issues with handleAnswer
  useEffect(() => {
    if (!timerActiveRef.current || selected !== null || finished) return;
    if (timer <= 0) {
      timerActiveRef.current = false;
      advance(null);
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, selected, finished]);

  const advance = useCallback(
    (choice: string | null) => {
      setSelected((prev) => {
        if (prev !== null) return prev; // already answered
        return choice ?? '';
      });
    },
    []
  );

  // Actually process the answer after selected state updates
  useEffect(() => {
    if (selected === null || finished) return;
    timerActiveRef.current = false;
    const q = questions[qi];
    if (!q) return;

    const correct = selected === q.word.english;
    if (correct) setScore((s) => s + 1);
    else setWrongAnswers((wa) => [...wa, { word: q.word, chosen: selected || 'Time up!' }]);
    onUpdate(updateWordProgress(progress, q.word.id, correct));
    speak(q.word.french, speed);

    const id = setTimeout(() => {
      if (qi + 1 >= questions.length) {
        setFinished(true);
      } else {
        setQi((i) => i + 1);
        setSelected(null);
        setTimer(15);
        timerActiveRef.current = true;
      }
    }, 1400);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  if (!started) {
    return (
      <div className="quiz-view" style={{ animation: 'fade .4s ease', textAlign: 'center', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: '2rem', marginBottom: '20px' }}>Ready for a Quiz?</h2>
        <div style={{ marginBottom: '30px' }}>
          <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: 'var(--ink-soft)' }}>
            Number of questions: 
            <select 
              className="quiz-select"
              value={questionCount} 
              onChange={e => setQuestionCount(Number(e.target.value))}
              style={{ marginLeft: '10px' }}
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={50}>50 Questions</option>
              <option value={words.length}>All ({words.length})</option>
            </select>
          </label>
        </div>
        <div className="quiz-actions" style={{ justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => startQuiz()}>Play Now</button>
          <button className="btn-secondary" onClick={onBack}>Cancel</button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic', marginBottom: '16px' }}>
        Not enough words for a quiz. Select more words or a broader category.
      </p>
      <button className="btn-secondary" onClick={onBack}>← Back</button>
    </div>
  );

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    return (
      <div className="quiz-finish" style={{ animation: 'fade .4s ease' }}>
        <div className="quiz-finish-emoji">{emoji}</div>
        <div className="quiz-finish-score">{score}/{questions.length}</div>
        <div className="quiz-finish-sub">{pct}% correct</div>
        <div className="gp-track" style={{ maxWidth: 320, margin: '0 auto 20px' }}>
          <div className="gp-fill" style={{ width: `${pct}%` }} />
        </div>

        {wrongAnswers.length > 0 && (
          <div className="quiz-review">
            <div className="quiz-review-title">⚠ Review these words</div>
            {wrongAnswers.map(({ word, chosen }, i) => (
              <div key={i} className="quiz-review-item">
                <div>
                  <div className="quiz-review-fr">{word.french}</div>
                  <div className="quiz-review-en">= {word.english}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button className="quiz-listen-btn" onClick={() => speak(word.french, speed)}>🔊</button>
                  <div className="quiz-review-said">You said:<br />{chosen}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="quiz-actions">
          <button className="btn-primary" onClick={startQuiz}>↺ Play Again</button>
          <button className="btn-secondary" onClick={onBack}>← Back</button>
        </div>
      </div>
    );
  }

  const q = questions[qi];
  const timerCls = timer > 10 ? '' : timer > 5 ? ' warn' : ' danger';

  return (
    <div className="quiz-view" style={{ animation: 'fade .4s ease' }}>
      <div className="quiz-header">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: 'var(--ink-soft)', letterSpacing: '.06em' }}>
          Question {qi + 1} / {questions.length}
        </span>
        <div className={`quiz-timer${timerCls}`}>{timer}</div>
      </div>

      <div className="gp-track" style={{ marginBottom: 18 }}>
        <div className="gp-fill" style={{ width: `${(qi / questions.length) * 100}%` }} />
      </div>

      <div className="quiz-question">
        <div className="quiz-prompt">What does this mean in English?</div>
        <div className="quiz-word">{q.word.french}</div>
        <div className="quiz-meta">
          <span className="quiz-level-tag">{q.word.level}</span>
          <button className="quiz-listen-btn" onClick={() => speak(q.word.french, speed)}>🔊 listen</button>
        </div>
      </div>

      <div className="quiz-choices">
        {q.choices.map((choice, i) => {
          const isCorrect = choice === q.word.english;
          const isSelected = selected === choice;
          let cls = 'quiz-btn';
          if (selected !== null) {
            if (isCorrect) cls += ' correct';
            else if (isSelected) cls += ' wrong';
            else cls += ' dimmed';
          }
          return (
            <button
              key={i}
              className={cls}
              disabled={selected !== null}
              onClick={() => advance(choice)}
            >
              <span className="opt">{String.fromCharCode(65 + i)}.</span>
              {choice}
              {selected !== null && isCorrect && <span style={{ marginLeft: 'auto', color: 'var(--good)' }}>✓</span>}
              {selected !== null && isSelected && !isCorrect && <span style={{ marginLeft: 'auto', color: 'var(--rust)' }}>✗</span>}
            </button>
          );
        })}
      </div>

      <div className="quiz-score">
        Score: <strong style={{ color: 'var(--accent)' }}>{score}</strong>
        &nbsp;·&nbsp; XP: <strong style={{ color: 'var(--gold)' }}>{progress.xp}</strong>
      </div>
    </div>
  );
}
