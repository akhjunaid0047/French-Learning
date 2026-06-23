'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
const SESSION_KEY = 'ff_turnstile_passed';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, params: object) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileGateProps {
  /** Called with the token once the challenge is solved. */
  onVerified: (token: string) => void;
}

export default function TurnstileGate({ onVerified }: TurnstileGateProps) {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;
    if (widgetIdRef.current) {
      try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
      widgetIdRef.current = null;
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      theme: 'light',
      callback: (token: string) => {
        setStatus('verifying');
        // Small delay so the "verifying…" state is visible
        setTimeout(() => {
          sessionStorage.setItem(SESSION_KEY, token);
          onVerified(token);
          setVisible(false);
        }, 600);
      },
      'error-callback': () => {
        setStatus('error');
        setErrMsg('Challenge failed — please try again.');
      },
      'expired-callback': () => {
        setStatus('error');
        setErrMsg('Challenge expired — refreshing…');
        if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
      },
    });
  }, [onVerified]);

  useEffect(() => {
    // Already passed this session
    if (sessionStorage.getItem(SESSION_KEY)) {
      onVerified(sessionStorage.getItem(SESSION_KEY)!);
      return;
    }

    // No site key configured → skip gate (local dev without keys)
    if (!SITE_KEY) {
      onVerified('dev-bypass');
      return;
    }

    setVisible(true);

    // Load the Turnstile script once
    if (!document.getElementById('cf-turnstile-script')) {
      window.onTurnstileLoad = renderWidget;
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    }
  }, [onVerified, renderWidget]);

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(33, 29, 23, 0.72)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        animation: 'gateIn .35s cubic-bezier(.2,.8,.2,1)',
      }}>
        {/* Card */}
        <div style={{
          background: 'var(--card)',
          border: '1.5px solid var(--line)',
          borderRadius: '18px',
          padding: 'clamp(32px, 6vw, 52px) clamp(28px, 5vw, 52px)',
          boxShadow: '0 4px 6px rgba(33,29,23,.06), 0 40px 80px -20px rgba(33,29,23,.55)',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Top accent stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))',
          }} />

          {/* Kicker */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px', letterSpacing: '.28em', textTransform: 'uppercase',
            color: 'var(--rust)', marginBottom: '18px',
          }}>
            Français · Field Notes
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 800,
            fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
            lineHeight: .96,
            letterSpacing: '-.02em',
            marginBottom: '10px',
          }}>
            FrenchFlow <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 500 }}>Field Notes</em>
          </h1>

          {/* Subtitle */}
          <p style={{
            color: 'var(--ink-soft)', fontStyle: 'italic',
            fontSize: '1rem', lineHeight: 1.6,
            maxWidth: '320px', margin: '0 auto 28px',
          }}>
            One quick check before we open the vault — verifying you&apos;re human.
          </p>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '24px',
          }}>
            <span style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase',
              color: 'var(--ink-soft)',
            }}>Human check</span>
            <span style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
          </div>

          {/* Turnstile widget mount point */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div ref={containerRef} id="turnstile-widget-container" />
          </div>

          {/* Status messages */}
          {status === 'verifying' && (
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--accent)', marginTop: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <span style={{ animation: 'spin .8s linear infinite', display: 'inline-block' }}>◌</span>
              Verifying…
            </div>
          )}

          {status === 'error' && (
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px', color: 'var(--rust)',
              marginTop: '8px',
            }}>
              ⚠ {errMsg}
            </div>
          )}

          {/* Footer note */}
          <p style={{
            marginTop: '24px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9.5px', letterSpacing: '.12em', textTransform: 'uppercase',
            color: 'var(--ink-soft)', opacity: .65,
            lineHeight: 1.5,
          }}>
            Protected by Cloudflare Turnstile · No data is stored
          </p>
        </div>
      </div>

      <style>{`
        @keyframes gateIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
