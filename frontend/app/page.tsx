'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { vocabulary, categories } from '@/lib/vocabulary';
import { loadProgress, saveProgress, checkDailyStreak, AppProgress } from '@/lib/progress';
import { primeFrenchVoices } from '@/lib/speech';
import { SearchIcon } from '@/components/icons';
import FlashcardView from '@/components/FlashcardView';
import BrowseView from '@/components/BrowseView';
import QuizView from '@/components/QuizView';
import StatsView from '@/components/StatsView';

type View = 'flashcards' | 'browse' | 'quiz' | 'stats';

export default function Home() {
  const [progress, setProgress] = useState<AppProgress | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeView, setActiveView] = useState<View>('flashcards');
  const [quizMode, setQuizMode] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const speed = slowMode ? 0.75 : 1.0;
  const isFullView = activeView === 'quiz' || activeView === 'stats';

  useEffect(() => {
    primeFrenchVoices();
    const p = checkDailyStreak(loadProgress());
    setProgress(p);
    saveProgress(p);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search]);

  const updateProgress = useCallback((p: AppProgress) => {
    setProgress(p);
    saveProgress(p);
  }, []);

  const filteredWords = useMemo(() =>
    vocabulary.filter((w) => {
      if (activeCategory !== 'all' && w.category !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return w.french.toLowerCase().includes(q) || w.english.toLowerCase().includes(q);
      }
      return true;
    }),
    [activeCategory, search]
  );

  const wordsPerPage = 100;
  const totalPages = Math.ceil(filteredWords.length / wordsPerPage);
  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * wordsPerPage;
    return filteredWords.slice(start, start + wordsPerPage);
  }, [filteredWords, currentPage]);

  if (!progress) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'JetBrains Mono',monospace", color: 'var(--ink-soft)', fontSize: '12px', letterSpacing: '.2em' }}>
      LOADING…
    </div>
  );

  const totalWords = vocabulary.length;
  const masteredCount = Object.values(progress.words).filter((w) => w.known).length;
  const masteredPct = totalWords > 0 ? (masteredCount / totalWords) * 100 : 0;
  const sectionStudied = filteredWords.filter((w) => progress.words[w.id]?.known).length;
  const sectionPct = filteredWords.length > 0 ? (sectionStudied / filteredWords.length) * 100 : 0;
  const catCount = (cat: string) => cat === 'all' ? vocabulary.length : vocabulary.filter((w) => w.category === cat).length;

  const resetProgress = () => {
    const fresh: AppProgress = { words: {}, totalStudied: 0, dailyStreak: 0, lastStudyDate: '', xp: 0, level: 1 };
    setProgress(fresh);
    saveProgress(fresh);
  };

  return (
    <>
      {/* Masthead */}
      <header className="masthead">
        <div className="kicker">Français · Vocabulary Companion</div>
        <h1>FrenchFlow <em>Field Notes</em></h1>
        <p className="subtitle">
          An interactive vault of the most common French words — definitions, examples &amp; pronunciation — wired for revision.
        </p>
        <div className="masthead-rule"><span></span> flip · listen · reveal · track <span></span></div>
      </header>

      {/* Global progress */}
      <div className="global-progress">
        <div className="gp-label">Mastery</div>
        <div className="gp-track"><div className="gp-fill" style={{ width: `${masteredPct}%` }} /></div>
        <div className="gp-label"><b>{masteredCount}</b> / {totalWords} studied</div>
      </div>

      {/* Sticky controls */}
      <div className="controls">
        <div className="controls-inner">
          {!isFullView && (
            <div className="search-wrap">
              <SearchIcon />
              <input
                className="search-input-field"
                type="text"
                placeholder="search words, concepts…"
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          {activeView === 'flashcards' && (
            <button className={`toggle-btn${quizMode ? ' active' : ''}`} onClick={() => setQuizMode((q) => !q)}>
              🎯 {quizMode ? 'Quiz Mode · ON' : 'Quiz Mode'}
            </button>
          )}
          <button className={`toggle-btn${slowMode ? ' active' : ''}`} onClick={() => setSlowMode((s) => !s)}>
            {slowMode ? '🐢 Slow Audio' : '🔊 Normal Speed'}
          </button>
          <button className={`toggle-btn${activeView === 'flashcards' ? ' active' : ''}`} onClick={() => setActiveView('flashcards')}>⊞ Flashcards</button>
          <button className={`toggle-btn${activeView === 'browse' ? ' active' : ''}`} onClick={() => setActiveView('browse')}>≡ Browse</button>
          <button className={`toggle-btn${activeView === 'quiz' ? ' active' : ''}`} onClick={() => setActiveView('quiz')}>📝 Quiz</button>
          <button className={`toggle-btn${activeView === 'stats' ? ' active' : ''}`} onClick={() => setActiveView('stats')}>📊 Stats</button>
          <button className="toggle-btn" onClick={resetProgress}>↺ Reset</button>
          <Link
            href="/contact"
            id="nav-contact-link"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              padding: '10px 15px',
              background: 'var(--accent)',
              color: 'var(--paper)',
              border: '1.5px solid var(--accent)',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'background .18s, border-color .18s',
              flexShrink: 0,
            }}
          >
            ✉ Contact
          </Link>
        </div>
      </div>

      {/* Category tabs (hidden in quiz/stats) */}
      {!isFullView && (
        <div className="tabs">
          {(['all', ...categories]).map((cat) => (
            <button
              key={cat}
              className={`tab${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? 'All Words' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              <span className="tab-count">{catCount(cat)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active view */}
      <main>
        {activeView === 'flashcards' && (
          <FlashcardView words={paginatedWords} progress={progress} onUpdate={updateProgress} quizMode={quizMode} speed={speed} activeCategory={activeCategory} sectionStudied={sectionStudied} sectionPct={sectionPct} startIndex={(currentPage - 1) * wordsPerPage} totalFiltered={filteredWords.length} />
        )}
        {activeView === 'browse' && (
          <BrowseView words={paginatedWords} progress={progress} onUpdate={updateProgress} speed={speed} activeCategory={activeCategory} sectionStudied={sectionStudied} sectionPct={sectionPct} startIndex={(currentPage - 1) * wordsPerPage} totalFiltered={filteredWords.length} />
        )}
        {activeView === 'quiz' && (
          <QuizView words={filteredWords.length >= 4 ? filteredWords : vocabulary} allWords={vocabulary} progress={progress} onUpdate={updateProgress} onBack={() => setActiveView('flashcards')} speed={speed} />
        )}
        {activeView === 'stats' && (
          <StatsView words={vocabulary} progress={progress} onBack={() => setActiveView('flashcards')} speed={speed} />
        )}

        {/* Pagination Controls */}
        {!isFullView && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '36px', paddingTop: '24px', borderTop: '1px dashed var(--line)' }}>
            <button 
              className="btn-secondary" 
              disabled={currentPage === 1} 
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'default' : 'pointer' }}
            >
              ← Prev
            </button>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--ink-soft)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="btn-secondary" 
              disabled={currentPage === totalPages} 
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'default' : 'pointer' }}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="site-footer">
        FrenchFlow Field Notes · {masteredCount} / {totalWords} mastered · XP {progress.xp} · 🔥 {progress.dailyStreak} day streak
        <span style={{ margin: '0 10px', opacity: .4 }}>·</span>
        <Link href="/contact" style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '.06em', transition: 'color .18s' }}>
          Contact &amp; Feedback
        </Link>
      </footer>

    </>
  );
}
