'use client';

import { useState, useCallback } from 'react';
import TurnstileGate from '@/components/TurnstileGate';

/**
 * Wraps the entire app in a Turnstile challenge gate.
 * Once the user passes, the token is kept in state and forwarded to the
 * global `window.__turnstileToken` so any component (TTS calls, etc.)
 * can read it without prop-drilling.
 */
export default function TurnstileProvider({ children }: { children: React.ReactNode }) {
  const [passed, setPassed] = useState(false);

  const handleVerified = useCallback((token: string) => {
    if (typeof window !== 'undefined') {
      (window as any).__turnstileToken = token;
    }
    setPassed(true);
  }, []);

  return (
    <>
      {/* Gate blocks interaction until challenge passes */}
      <TurnstileGate onVerified={handleVerified} />
      {/* Render children immediately; gate overlay sits on top */}
      {children}
    </>
  );
}
