const API_BASE_URL = process.env.NEXT_PUBLIC_TTS_API_BASE_URL?.trim() || '';

let activeAudio: HTMLAudioElement | null = null;

export function primeFrenchVoices() {
  // Skip if API backend is configured — browser synthesis won't be used
  if (typeof window === 'undefined' || !window.speechSynthesis || API_BASE_URL) return;
  window.speechSynthesis.getVoices();
}

async function speakWithApi(text: string, speed = 1.0) {
  if (!API_BASE_URL) {
    throw new Error('TTS API is not configured.');
  }

  const response = await fetch(`${API_BASE_URL}/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, speed }),
  });

  if (!response.ok) {
    throw new Error(`TTS API request failed with ${response.status}.`);
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = '';
  }

  const audio = new Audio(audioUrl);
  activeAudio = audio;

  audio.addEventListener(
    'ended',
    () => {
      URL.revokeObjectURL(audioUrl);
      if (activeAudio === audio) {
        activeAudio = null;
      }
    },
    { once: true }
  );

  audio.addEventListener(
    'error',
    () => {
      URL.revokeObjectURL(audioUrl);
      if (activeAudio === audio) {
        activeAudio = null;
      }
    },
    { once: true }
  );

  await audio.play();
}

function speakWithBrowser(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text.trim()) return;

  const synth = window.speechSynthesis;

  const doSpeak = () => {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.82;
    utterance.pitch = 1;

    const frenchVoice = synth.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('fr'));
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    synth.speak(utterance);
  };

  const voices = synth.getVoices();
  if (voices.length > 0) {
    doSpeak();
    return;
  }

  synth.addEventListener('voiceschanged', doSpeak, { once: true });
  window.setTimeout(() => {
    if (!synth.speaking && !synth.pending) {
      doSpeak();
    }
  }, 400);
}

export async function speakFrench(text: string, speed = 1.0) {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (API_BASE_URL) {
    try {
      await speakWithApi(trimmed, speed);
      return;
    } catch (error) {
      console.warn('Falling back to browser speech synthesis.', error);
    }
  }

  speakWithBrowser(trimmed);
}
