import { useEffect, useMemo, useState } from 'react';

const PROMO_DURATION_MS = 90 * 60 * 1000;
const RESET_WINDOW_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'ssdoces-promo-cycle-start';

function ensureCycleStart() {
  if (typeof window === 'undefined') {
    return Date.now();
  }

  const current = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
  const now = Date.now();

  if (!current || now - current >= RESET_WINDOW_MS) {
    window.localStorage.setItem(STORAGE_KEY, String(now));
    return now;
  }

  return current;
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function PromoBanner() {
  const [cycleStart, setCycleStart] = useState(() => ensureCycleStart());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setCycleStart(ensureCycleStart());
    const interval = window.setInterval(() => {
      const currentStart = ensureCycleStart();
      setCycleStart(currentStart);
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const content = useMemo(() => {
    const elapsed = now - cycleStart;
    const remainingPromo = PROMO_DURATION_MS - elapsed;

    if (remainingPromo > 0) {
      return {
        active: true,
        label: '🔥 Oferta Imperdível! Promoções terminam em:',
        value: formatTime(remainingPromo),
      };
    }

    return {
      active: false,
      label: 'As promoções de hoje terminaram. A próxima abre em:',
      value: formatTime(RESET_WINDOW_MS - elapsed),
    };
  }, [cycleStart, now]);

  return (
    <div className={`border-b px-4 py-3 text-center text-sm font-medium ${content.active ? 'bg-[#3d2415] text-[#fff7ef]' : 'bg-[#f7efe5] text-[#5a3520]'}`}>
      <span>{content.label}</span>{' '}
      <span className="font-display text-base tracking-[0.08em]">{content.value}</span>
    </div>
  );
}