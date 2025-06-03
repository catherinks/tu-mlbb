import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Эффект для загрузки данных команды
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем данные команды с информацией о капитане
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select(`
            *,
            captain:users!captain_id (id, nickname, avatar_url)
          `)
          .eq('id', id)
          .single();

        if (teamError) throw teamError;
        if (!teamData) throw new Error('Команда не найдена');

        setTeam(teamData);

        // Получаем участников команды (исключая капитана)
        const participantIds = teamData.participants 
          ? teamData.participants.filter(id => id !== teamData.captain_id)
          : [];

        if (participantIds.length > 0) {
          const { data: participantsData, error: participantsError } = await supabase
            .from('users')
            .select('id, nickname, avatar_url')
            .in('id', participantIds);

          if (participantsError) throw participantsError;
          setParticipants(participantsData || []);
        }
      } catch (err) {
        console.error('Error fetching team:', err);
        setError(err.message || 'Не удалось загрузить данные команды');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [id]);

  // Состояние загрузки
  if (loading) {
    return (
      <div className="w-full bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 shadow shadow-blue-500/50"></div>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="w-full bg-gray-900 min-h-screen">
        <div className="mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
            {error}
          </div>
          <Link 
            to="/teams" 
            className="inline-flex items-center mt-4 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Назад к командам
          </Link>
        </div>
      </div>
    );
  }

  // Если команда не найдена
  if (!team) {
    return (
      <div className="w-full bg-gray-900 min-h-screen">
        <div className="mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-4 rounded-lg">
            Команда не найдена
          </div>
          <Link 
            to="/teams" 
            className="inline-flex items-center mt-4 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Назад к командам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 py-8 max-w-4xl">
        {/* Кнопка возврата к списку команд */}
        <div className="mb-6">
          <Link 
            to="/teams" 
            className="inline-flex items-center px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Назад к командам
          </Link>
        </div>

        {/* Карточка команды */}
        <article className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6 mb-8 relative overflow-hidden">
          {/* Декоративные элементы */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Блок с логотипом команды */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full border-2 border-gray-600 overflow-hidden bg-gray-700 flex items-center justify-center">
                {team.logo_url ? (
                  <img 
                    src={team.logo_url} 
                    alt={`Логотип ${team.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-team-logo.png';
                    }}
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-500">
                    {team.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Основная информация о команде */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 mb-2">
                {team.name}
              </h1>

              {team.description && (
                <p className="text-gray-400 mb-4">{team.description}</p>
              )}

              {/* Статистика команды */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Блок с капитаном */}
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Капитан</div>
                  <div className="flex items-center">
                    <img 
                      src={team.captain?.avatar_url || '/default-avatar.png'} 
                      alt={team.captain?.nickname}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="text-gray-300 font-medium">
                      {team.captain?.nickname || 'Не указан'}
                    </span>
                  </div>
                </div>

                {/* Блок с количеством участников */}
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Участников</div>
                  <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {participants.length + 1}/5
                  </div>
                </div>
              </div>

              {/* Блок с датой создания */}
              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Создана</div>
                <div className="text-gray-300">
                  {new Date(team.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Секция с участниками команды */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
            Участники команды
          </h2>

          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6">
            {/* Блок с капитаном */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Капитан</h3>
              <div className="flex items-center p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                <img 
                  src={team.captain?.avatar_url || '/default-avatar.png'} 
                  alt={team.captain?.nickname}
                  className="w-12 h-12 rounded-full border-2 border-blue-400/50 mr-4"
                />
                <div>
                  <p className="font-medium text-gray-300">{team.captain?.nickname || 'Не указан'}</p>
                  <p className="text-xs text-blue-400">Капитан команды</p>
                </div>
              </div>
            </div>

            {/* Блок с участниками */}
            {participants.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Игроки ({participants.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {participants.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:border-blue-400/50 transition-colors"
                    >
                      <img 
                        src={user.avatar_url || '/default-avatar.png'} 
                        alt={user.nickname}
                        className="w-10 h-10 rounded-full border border-gray-500 mr-3"
                      />
                      <span className="font-medium text-gray-300">{user.nickname}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Нет других участников</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}