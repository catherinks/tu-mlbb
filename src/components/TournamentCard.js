import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';
import { useEffect, useState } from 'react';

export default function TournamentCard({ tournament }) {
  const [currentStatus, setCurrentStatus] = useState(tournament.status);

  useEffect(() => {
    // Функция для определения актуального статуса
    const determineStatus = () => {
      const now = new Date();
      const startDate = new Date(tournament.start_date);
      const endDate = tournament.end_date ? new Date(tournament.end_date) : null;

      if (endDate && now > endDate) {
        return 'completed';
      } else if (now >= startDate && (!endDate || now <= endDate)) {
        return 'ongoing';
      } else {
        return 'upcoming';
      }
    };

    // Устанавливаем начальный статус
    setCurrentStatus(determineStatus());

    // Если турнир еще не начался или идет, устанавливаем интервал для проверки
    if (currentStatus !== 'completed') {
      const intervalId = setInterval(() => {
        setCurrentStatus(determineStatus());
      }, 60000); // Проверяем каждую минуту

      return () => clearInterval(intervalId);
    }
  }, [tournament.start_date, tournament.end_date, currentStatus]);

  return (
    <Link 
      to={`/tournaments/${tournament.id}`}
      className="group relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-blue-400/50 transition-all duration-300"
    >
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
            {tournament.name}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            currentStatus === 'upcoming' ? 'bg-blue-900/50 text-blue-300 border border-blue-400/30' :
            currentStatus === 'ongoing' ? 'bg-green-900/50 text-green-300 border border-green-400/30' :
            'bg-gray-700 text-gray-400 border border-gray-600'
          }`}>
            {currentStatus === 'upcoming' ? 'ПРЕДСТОЯЩИЙ' :
             currentStatus === 'ongoing' ? 'ТЕКУЩИЙ' : 'ЗАВЕРШЕН'}
          </span>
        </div>
        
        <p className="text-gray-400 mb-4 line-clamp-2 group-hover:text-gray-300 transition-colors">
          {tournament.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Начало</p>
            <p className="font-medium text-gray-300">
              {new Date(tournament.start_date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Призовой фонд</p>
            <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 group-hover:from-blue-300 group-hover:to-purple-300 transition-all">
              ${tournament.prize_pool.toLocaleString()}
            </p>
          </div>
        </div>
        
        {currentStatus === 'upcoming' && (
          <div className="mt-4">
            <CountdownTimer 
              targetDate={tournament.start_date} 
              className="text-xs"
              darkMode={true}
            />
          </div>
        )}

        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </Link>
  );
}