import { useState, useEffect } from 'react';

/**
 * Live countdown — returns { days, hours, mins, secs, passed }
 * Color-coded: red < 3d, amber 3-7d, green > 7d
 */
const useCountdown = (targetDate) => {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, passed: true };
    return {
      days:   Math.floor(diff / 86400000),
      hours:  Math.floor((diff % 86400000) / 3600000),
      mins:   Math.floor((diff % 3600000)  / 60000),
      secs:   Math.floor((diff % 60000)    / 1000),
      passed: false,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
};

const CountdownBadge = ({ targetDate, compact = false }) => {
  const t = useCountdown(targetDate);
  if (t.passed) return (
    <span className="text-xs font-bold text-red-500">Deadline passed</span>
  );
  const color = t.days < 3 ? 'text-red-500' : t.days < 7 ? 'text-amber-500' : 'text-emerald-500';
  if (compact) return (
    <span className={`text-xs font-bold ${color}`}>
      {t.days}d {t.hours}h left
    </span>
  );
  return (
    <div className={`flex items-center gap-1 text-xs font-bold ${color}`}>
      <span>{t.days}d</span>
      <span>{t.hours}h</span>
      <span>{t.mins}m</span>
      <span>{t.secs}s</span>
    </div>
  );
};

export { useCountdown, CountdownBadge };
export default CountdownBadge;
