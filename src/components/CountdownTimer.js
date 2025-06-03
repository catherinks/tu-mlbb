import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate, className = '' }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timeUnits = [
    { key: 'days', label: 'дней', short: 'дн' },
    { key: 'hours', label: 'часов', short: 'час' },
    { key: 'minutes', label: 'минут', short: 'мин' },
    { key: 'seconds', label: 'секунд', short: 'сек' }
  ];

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg hover:shadow-blue-500/20 transition-all ${className}`}>
      {/* Неоновая акцентная полоса */}
      <div className="h-0.5 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-3 rounded-full shadow shadow-blue-400/30"></div>
      
      {/* Заголовок */}
      <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center">
        <svg className="w-3 h-3 mr-1.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        До начала турнира
      </h4>
      
      {/* Блоки с временем */}
      <div className="flex justify-between space-x-2">
        {timeUnits.map((unit) => (
          <div key={unit.key} className="flex-1 text-center">
            <div className="bg-gray-700 rounded-md p-1.5 border border-gray-600 hover:border-blue-400/30 transition-colors group">
              <span className="block text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-mono group-hover:from-blue-300 group-hover:to-purple-300 transition-all">
                {timeLeft[unit.key]?.toString().padStart(2, '0') || '00'}
              </span>
              <span className="block text-[0.65rem] text-gray-400 mt-1 group-hover:text-blue-300 transition-colors">
                {unit.short}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Сообщение о начале турнира */}
      {Object.keys(timeLeft).length === 0 && (
        <div className="mt-3 text-center text-sm font-medium text-purple-400 flex items-center justify-center animate-pulse">
          <svg className="w-4 h-4 mr-1.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Турнир начинается!
        </div>
      )}
      
      {/* Эффект свечения при наведении */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
    </div>
  );
}