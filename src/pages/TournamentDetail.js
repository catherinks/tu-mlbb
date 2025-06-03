import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CountdownTimer from '../components/CountdownTimer';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function TournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [userTeam, setUserTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [user, setUser] = useState(null);
  const [registeredTeams, setRegisteredTeams] = useState([]);

  // Определяет текущий статус турнира
  const determineStatus = (tournamentData) => {
    if (!tournamentData) return 'upcoming';
    
    const now = new Date();
    const startDate = new Date(tournamentData.start_date);
    const endDate = tournamentData.end_date ? new Date(tournamentData.end_date) : null;

    if (endDate && now > endDate) {
      return 'completed';
    } else if (now >= startDate && (!endDate || now <= endDate)) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  };

  // Получаем текущего пользователя при монтировании
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  // Основной эффект для загрузки данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем данные турнира
        const { data: tournamentData, error: tournamentError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', id)
          .single();

        if (tournamentError) {
          if (tournamentError.code === 'PGRST116') {
            setError('Турнир не найден');
          } else {
            throw tournamentError;
          }
          return;
        }

        setTournament(tournamentData);
        setCurrentStatus(determineStatus(tournamentData));

        // Загружаем зарегистрированные команды
        const { data: teamsData } = await supabase
          .from('tournament_participants')
          .select('team:teams(id, name, captain_id)')
          .eq('tournament_id', id);

        setRegisteredTeams(teamsData?.map(item => item.team) || []);
        setTournament(prev => ({
          ...prev,
          participants_count: teamsData?.length || 0
        }));

        // Если пользователь авторизован, загружаем его команду
        if (user?.id) {
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .or(`captain_id.eq.${user.id},participants.cs.{${user.id}}`)
            .single();

          if (teamError && teamError.code !== 'PGRST116') throw teamError;
          
          if (teamData) {
            // Собираем всех уникальных участников команды
            const allMembers = new Set();

            // Добавляем капитана
            if (teamData.captain_id) {
              const { data: captainData } = await supabase
                .from('users')
                .select('id, email, first_name, last_name, nickname')
                .eq('id', teamData.captain_id)
                .single();
              
              if (captainData) allMembers.add(captainData);
            }

            // Добавляем остальных участников
            if (teamData.participants?.length > 0) {
              const { data: membersData } = await supabase
                .from('users')
                .select('id, email, first_name, last_name, nickname')
                .in('id', teamData.participants.filter(id => id !== teamData.captain_id));
              
              membersData?.forEach(member => allMembers.add(member));
            }

            const membersArray = Array.from(allMembers);
            setTeamMembers(membersArray);

            setUserTeam({
              ...teamData,
              members: membersArray
            });

            // Проверяем регистрацию команды
            const { data: registration } = await supabase
              .from('tournament_participants')
              .select('*')
              .eq('team_id', teamData.id)
              .eq('tournament_id', id);
              
            setIsRegistered(!!registration?.length);
          }
        }
      } catch (err) {
        setError(err.message);
        toast.error('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.id]);

  // Эффект для обновления статуса турнира
  useEffect(() => {
    if (!tournament) return;

    const updateStatus = () => {
      const newStatus = determineStatus(tournament);
      if (newStatus !== currentStatus) {
        setCurrentStatus(newStatus);
      }
    };

    updateStatus();

    // Устанавливаем интервал проверки статуса для незавершенных турниров
    if (currentStatus !== 'completed') {
      const intervalId = setInterval(updateStatus, 60000);
      return () => clearInterval(intervalId);
    }
  }, [tournament, currentStatus]);

  //Обработчик клика по кнопке регистрации
  const handleRegisterClick = () => {
    if (!user) {
      toast.error('Необходимо авторизоваться');
      return;
    }

    if (!userTeam) {
      toast.error('Нет команды');
      return;
    }

    const isMember = teamMembers.some(member => member.id === user.id);
    
    if (!isMember) {
      toast.error('Только участники могут регистрировать');
      return;
    }

    const teamSize = teamMembers.length;
    
    if (teamSize < 5) {
      toast.error(`Недостаточно участников (${teamSize} из 5)`);
      return;
    }

    setShowRegistrationForm(true);
  };

  //Регистрирует команду на турнир
  const handleRegisterTeam = async () => {
    try {
      const { error: registrationError } = await supabase
        .from('tournament_participants')
        .insert([{
          tournament_id: id,
          team_id: userTeam.id,
          registered_at: new Date().toISOString()
        }]);

      if (registrationError) throw registrationError;

      // Обновляем список зарегистрированных команд
      const { data: teamsData } = await supabase
        .from('tournament_participants')
        .select('team:teams(id, name, captain_id)')
        .eq('tournament_id', id);

      setRegisteredTeams(teamsData?.map(item => item.team) || []);
      
      // Обновляем состояние
      setIsRegistered(true);
      setShowRegistrationForm(false);
      setTournament(prev => ({
        ...prev,
        participants_count: (prev.participants_count || 0) + 1
      }));

      toast.success('Команда успешно зарегистрирована!');
    } catch (err) {
      setError(err.message);
      toast.error('Ошибка при регистрации команды');
    }
  };

  //Форматирует имя пользователя для отображения
  const displayUserName = (user) => {
    if (!user) return '';
    return user.nickname || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
  };

  // Состояние загрузки
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
    </div>
  );
  
  // Состояние ошибки
  if (error) return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-900/50 rounded-lg text-red-300">
      <p>{error}</p>
    </div>
  );
  
  // Турнир не найден
  if (!tournament) return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-yellow-900/50 rounded-lg text-yellow-300">
      Турнир не найден
    </div>
  );

  // Стили для статусов турнира
  const statusBadge = {
    upcoming: { class: 'bg-blue-900/50 text-blue-300 border border-blue-400/30', text: 'ПРЕДСТОЯЩИЙ' },
    ongoing: { class: 'bg-green-900/50 text-green-300 border border-green-400/30', text: 'ТЕКУЩИЙ' },
    completed: { class: 'bg-gray-700 text-gray-400 border border-gray-600', text: 'ЗАВЕРШЕН' }
  };

  return (
    <div className="w-full bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 py-8 max-w-6xl">
        {/* Кнопка возврата к списку турниров */}
        <div className="mb-6">
          <Link 
            to="/tournaments" 
            className="inline-flex items-center px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Назад к турнирам
          </Link>
        </div>
        
        {/* Основная информация о турнире */}
        <article className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          {/* Бейдж статуса турнира */}
          <div className="flex justify-between items-start mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[currentStatus]?.class}`}>
              {statusBadge[currentStatus]?.text}
            </span>
          </div>
          
          {/* Название турнира */}
          <h1 className="text-3xl font-bold mb-4 text-white">
            {tournament.name}
          </h1>
          
          {/* Описание турнира */}
          <div className="prose max-w-none mb-6 text-gray-400">
            {tournament.description}
          </div>

          {/* Статистика турнира */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Дата начала */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Дата начала</div>
              <div className="text-lg font-semibold text-gray-300">
                {new Date(tournament.start_date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
            
            {/* Призовой фонд */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Призовой фонд</div>
              <div className="text-lg font-bold text-blue-400">
                ${tournament.prize_pool.toLocaleString()}
              </div>
            </div>
            
            {/* Количество зарегистрированных команд */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Команд зарегистрировано</div>
              <div className="text-lg font-semibold text-gray-300">
                {tournament.participants_count || 0}
              </div>
            </div>
          </div>

          {/* Таймер обратного отсчета для предстоящих турниров */}
          {currentStatus === 'upcoming' && (
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <CountdownTimer 
                targetDate={tournament.start_date} 
                className="text-xl font-mono text-blue-400" 
              />
            </div>
          )}

          {/* Кнопка регистрации команды */}
          {!isRegistered && currentStatus === 'upcoming' && (
            <button
              onClick={handleRegisterClick}
              className="px-6 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 transition-all"
            >
              Зарегистрировать команду
            </button>
          )}

          {/* Форма подтверждения регистрации */}
          {showRegistrationForm && userTeam && (
            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-white">Подтверждение регистрации</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-300">Команда: {userTeam.name}</p>
                </div>
                <div>
                  <p className="font-medium mb-2 text-gray-300">Состав команды:</p>
                  <ul className="space-y-2">
                    {teamMembers.map(member => (
                      <li key={member.id} className="text-gray-300">
                        {displayUserName(member)}
                        {member.id === user?.id && ' (Вы)'}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleRegisterTeam}
                    className="px-4 py-2 bg-green-600 rounded-lg text-white font-medium hover:bg-green-500 transition-all"
                  >
                    Подтвердить регистрацию
                  </button>
                  <button
                    onClick={() => setShowRegistrationForm(false)}
                    className="px-4 py-2 bg-gray-600 rounded-lg text-white font-medium hover:bg-gray-500 transition-all"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Секция с правилами турнира */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Правила турнира
          </h2>
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="prose max-w-none text-gray-400">
              {tournament.rules || <p className="text-gray-500">Правила не указаны</p>}
            </div>
          </div>
        </section>

        {/* Секция с зарегистрированными командами */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Зарегистрированные команды ({registeredTeams.length})
          </h2>
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            {registeredTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {registeredTeams.map(team => (
                  <div key={team.id} className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-medium text-lg text-white mb-2">{team.name}</h3>
                    {team.captain_id === user?.id && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-900/50 text-blue-300 rounded">
                        Ваша команда
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Пока нет зарегистрированных команд</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}