import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact — FrenchFlow Field Notes',
  description: 'Get in touch with feedback or suggestions for FrenchFlow Field Notes, your interactive French vocabulary companion.',
};

export default function ContactPage() {
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

      {/* Sticky nav back */}
      <div className="controls">
        <div className="controls-inner">
          <Link href="/" className="toggle-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            ← Back to App
          </Link>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--ink-soft)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Contact &amp; Feedback
          </span>
        </div>
      </div>

      <main>
        {/* Page title */}
        <div className="section-head" style={{ marginBottom: '40px' }}>
          <div className="sec-tag">Get in Touch</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '2.3rem', letterSpacing: '-.02em', marginTop: '6px' }}>
            Feedback &amp; Suggestions
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic', marginTop: '6px', fontSize: '1rem' }}>
            Have a word to add, a bug to report, or just want to say <em>bonjour</em>? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>

          {/* Email card */}
          <div className="contact-card contact-card--primary">
            <div className="contact-card__icon">✉</div>
            <div className="contact-card__label">Email Us</div>
            <a
              id="contact-email-link"
              href="mailto:contact@teddycreates.in"
              className="contact-card__value"
            >
              contact@teddycreates.in
            </a>
            <p className="contact-card__desc">
              Drop us a line for any feedback, suggestions, or vocabulary requests. We read every message.
            </p>
            <a
              id="contact-cta-email"
              href="mailto:contact@teddycreates.in?subject=FrenchFlow%20Feedback"
              className="btn-primary"
              style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none', textAlign: 'center' }}
            >
              ✉ Send an Email
            </a>
          </div>

          {/* What to include card */}
          <div className="contact-card">
            <div className="contact-card__icon">📝</div>
            <div className="contact-card__label">What to Include</div>
            <ul className="contact-tips-list">
              <li>
                <span className="contact-tip-dot"></span>
                <span><strong>Bug reports</strong> — describe what you saw and what you expected</span>
              </li>
              <li>
                <span className="contact-tip-dot"></span>
                <span><strong>Missing words</strong> — the French word, its English meaning &amp; category</span>
              </li>
              <li>
                <span className="contact-tip-dot"></span>
                <span><strong>Feature ideas</strong> — any study mode or UI improvement you&apos;d like to see</span>
              </li>
              <li>
                <span className="contact-tip-dot"></span>
                <span><strong>Pronunciation issues</strong> — the word and the expected audio</span>
              </li>
            </ul>
          </div>

          {/* Response card */}
          <div className="contact-card">
            <div className="contact-card__icon">⏱</div>
            <div className="contact-card__label">Response Time</div>
            <div className="contact-card__value" style={{ fontSize: '1.6rem', fontFamily: "'Fraunces', serif" }}>
              1–3 days
            </div>
            <p className="contact-card__desc">
              We aim to respond to all messages within a few business days. For urgent issues, please mark your subject line with <em>[URGENT]</em>.
            </p>
            <div style={{ marginTop: '20px', padding: '14px 16px', background: 'var(--paper-deep)', borderRadius: '8px', border: '1px dashed var(--line)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--rust)', marginBottom: '6px' }}>
                Pro tip
              </div>
              <p style={{ fontSize: '.9rem', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
                Use the <strong>Reset</strong> button on the main app to clear your progress locally — no email needed.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed var(--line)', marginBottom: '48px' }}></div>

        {/* About section */}
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <div className="sec-tag" style={{ marginBottom: '10px' }}>About the Project</div>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.72, color: 'var(--ink-soft)', fontStyle: 'italic', marginBottom: '18px' }}>
            FrenchFlow Field Notes is a passion project built to make French vocabulary study beautiful and effective. It&apos;s entirely free and open to feedback from learners at every level — <em>débutant</em> to <em>avancé</em>.
          </p>
          <Link href="/" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            ← Return to Study
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <span>FrenchFlow Field Notes · </span>
        <a href="mailto:contact@teddycreates.in" style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '.06em' }}>
          contact@teddycreates.in
        </a>
      </footer>

      <style>{`
        .contact-card {
          background: var(--card);
          border: 1.5px solid var(--line);
          border-radius: 14px;
          padding: 28px 26px;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          transition: border-color .2s, transform .2s;
        }
        .contact-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }
        .contact-card--primary {
          border-color: var(--accent);
          position: relative;
          overflow: hidden;
        }
        .contact-card--primary::before {
          content: "";
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 5px;
          background: var(--accent);
        }
        .contact-card__icon {
          font-size: 1.8rem;
          margin-bottom: 14px;
          line-height: 1;
        }
        .contact-card__label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--rust);
          margin-bottom: 10px;
        }
        .contact-card__value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1rem;
          color: var(--accent);
          font-weight: 700;
          letter-spacing: .04em;
          text-decoration: none;
          word-break: break-all;
          transition: color .18s;
        }
        .contact-card__value:hover {
          color: var(--accent-bright);
          text-decoration: underline;
        }
        .contact-card__desc {
          color: var(--ink-soft);
          font-style: italic;
          font-size: .95rem;
          line-height: 1.6;
          margin-top: 10px;
          flex: 1;
        }
        .contact-tips-list {
          list-style: none;
          margin-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 13px;
          flex: 1;
        }
        .contact-tips-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: .95rem;
          line-height: 1.55;
          color: var(--ink-soft);
        }
        .contact-tips-list li strong {
          color: var(--ink);
        }
        .contact-tip-dot {
          flex-shrink: 0;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          margin-top: 7px;
        }
        @media (max-width: 640px) {
          .contact-card { padding: 22px 18px; }
          .contact-card--primary::before { display: none; }
        }
      `}</style>
    </>
  );
}
