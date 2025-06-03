import { Link } from 'react-router-dom';

export default function TeamCard({ team }) {
  // Функция для обработки ошибок загрузки изображений
  const handleImageError = (e, defaultImage) => {
    e.target.src = defaultImage;
  };

  return (
    <Link 
      to={`/teams/${team.id}`}
      className="group relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-blue-400/50 transition-all duration-300"
    >
      <div className="p-5 relative z-10">
        {/* Блок с логотипом и названием команды */}
        <div className="flex flex-col items-center mb-4">
          {team.logo_url && (
            <img 
              src={team.logo_url} 
              alt={`Логотип ${team.name}`}
              className="w-16 h-16 rounded-full mb-3 border-2 border-gray-600 group-hover:border-blue-400/50 transition-colors object-cover"
              onError={(e) => handleImageError(e, '/default-team-logo.png')}
            />
          )}
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 group-hover:from-blue-400 group-hover:to-purple-400 transition-all text-center">
            {team.name}
          </h3>
        </div>

        {/* Блок с описанием команды (если есть) */}
        {team.description && (
          <p className="text-gray-400 mb-4 line-clamp-2 group-hover:text-gray-300 transition-colors text-sm">
            {team.description}
          </p>
        )}

        {/* Блок с информацией о капитане */}
        <div className="space-y-3">
          <div className="flex items-center">
            <img 
              src={team.captain?.avatar_url || '/default-avatar.png'} 
              alt={team.captain?.nickname}
              className="w-8 h-8 rounded-full mr-3 border border-gray-600"
              onError={(e) => handleImageError(e, '/default-avatar.png')}
            />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Капитан</p>
              <p className="text-sm font-medium text-gray-300">
                {team.captain?.nickname || 'Не указан'}
              </p>
            </div>
          </div>
        </div>

        {/* Блок с датой создания команды */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Создана</p>
          <p className="text-sm text-gray-400">
            {new Date(team.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Декоративные элементы (точки по углам) */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </Link>
  );
}