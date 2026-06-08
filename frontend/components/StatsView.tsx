'use client';
import { Word } from '@/lib/vocabulary';
import { AppProgress } from '@/lib/progress';
import { speakFrench as speak } from '@/lib/speech';

interface Props {
  words: Word[];
  progress: AppProgress;
  onBack: () => void;
  speed: number;
}

export default function StatsView({ words, progress, onBack, speed }: Props) {
  const wordList = Object.values(progress.words);
  const mastered = wordList.filter((w) => w.known).length;
  const totalSeen = wordList.length;
  const totalCorrect = wordList.reduce((a, w) => a + w.correct, 0);
  const totalAttempts = wordList.reduce((a, w) => a + w.correct + w.incorrect, 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const byLevel = ['A1', 'A2', 'B1', 'B2'].map((level) => {
    const lw = words.filter((w) => w.level === level);
    return { level, total: lw.length, mastered: lw.filter((w) => progress.words[w.id]?.known).length };
  });

  const byCategory = [...new Set(words.map((w) => w.category))].map((cat) => {
    const cw = words.filter((w) => w.category === cat);
    return { cat, total: cw.length, mastered: cw.filter((w) => progress.words[w.id]?.known).length };
  });

  const weakWords = words
    .map((w) => ({ word: w, wp: progress.words[w.id] }))
    .filter(({ wp }) => wp && wp.incorrect > 0)
    .sort((a, b) => (b.wp?.incorrect ?? 0) - (a.wp?.incorrect ?? 0))
    .slice(0, 8);

  const xpToNext = 200 - (progress.xp % 200);
  const xpPct = ((progress.xp % 200) / 200) * 100;

  return (
    <div className="stats-view" style={{ animation: 'fade .4s ease' }}>
      <div className="stats-header">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <h2>My Progress</h2>
      </div>

      {/* Overview stat cards */}
      <div className="stats-grid">
        {[
          { icon: '✅', val: mastered, lbl: 'Mastered' },
          { icon: '👁', val: totalSeen, lbl: 'Words Seen' },
          { icon: '🎯', val: `${accuracy}%`, lbl: 'Accuracy' },
          { icon: '⚡', val: progress.xp, lbl: 'Total XP' },
          { icon: '🔥', val: progress.dailyStreak, lbl: 'Day Streak' },
        ].map((s) => (
          <div key={s.lbl} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Progress by level */}
      <div className="stats-section">
        <div className="stats-section-title">Progress by Level</div>
        <div className="stats-bar-row">
          {byLevel.map(({ level, total, mastered: m }) => {
            const pct = total > 0 ? Math.round((m / total) * 100) : 0;
            const color = level === 'A1' ? 'var(--good)' : level === 'A2' ? 'var(--accent)' : level === 'B1' ? 'var(--gold)' : 'var(--rust)';
            return (
              <div key={level}>
                <div className="stats-bar-label">
                  <strong style={{ color }}>{level}</strong>
                  <span>{m} / {total} · {pct}%</span>
                </div>
                <div className="gp-track">
                  <div className="gp-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}99)` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress by category */}
      <div className="stats-section">
        <div className="stats-section-title">Progress by Category</div>
        <div className="stats-cat-grid">
          {byCategory.map(({ cat, total, mastered: m }) => {
            const pct = total > 0 ? Math.round((m / total) * 100) : 0;
            return (
              <div key={cat} className="stats-cat-item">
                <div className="stats-cat-name">
                  <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                  <span style={{ color: 'var(--ink-soft)' }}>{pct}%</span>
                </div>
                <div className="gp-track" style={{ height: 5 }}>
                  <div className="gp-fill" style={{ width: `${pct}%` }} />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: 'var(--ink-soft)', marginTop: 4 }}>
                  {m} / {total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak words */}
      {weakWords.length > 0 && (
        <div className="stats-section">
          <div className="stats-section-title">⚠ Words to Practice</div>
          <div className="stats-weak-list">
            {weakWords.map(({ word, wp }) => (
              <div key={word.id} className="stats-weak-item">
                <div>
                  <div className="stats-weak-fr">{word.french}</div>
                  <div className="stats-weak-en">{word.english}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="stats-weak-counts">
                    <span style={{ color: 'var(--good)' }}>✓ {wp?.correct ?? 0}</span>
                    <span style={{ color: 'var(--rust)' }}>✗ {wp?.incorrect ?? 0}</span>
                  </div>
                  <button className="quiz-listen-btn" onClick={() => speak(word.french, speed)}>🔊</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* XP / Level */}
      <div className="stats-xp-card">
        <div style={{ fontSize: '2rem' }}>⭐</div>
        <div className="stats-xp-level">Level {progress.level}</div>
        <div className="stats-xp-sub">{xpToNext} XP to next level</div>
        <div className="gp-track" style={{ maxWidth: 300, margin: '0 auto' }}>
          <div className="gp-fill" style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg,var(--gold),var(--rust))' }} />
        </div>
      </div>
    </div>
  );
}
