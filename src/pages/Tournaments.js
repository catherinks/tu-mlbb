import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import TournamentCard from '../components/TournamentCard';
import CreateTournamentModal from '../pages/CreateTournament';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [userRole, setUserRole] = useState(null); 
  const [showCreateModal, setShowCreateModal] = useState(false); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  // Получение данных пользователя (роли)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Получаем текущего пользователя
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        if (!user) {
          navigate('/login');
          return;
        }

        // Получаем роль пользователя из таблицы users
        const { data, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        // Игнорируем ошибку "не найдено" (PGRST116), устанавливаем роль по умолчанию
        if (userError && userError.code !== 'PGRST116') throw userError;
        setUserRole(data?.role || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // По умолчанию обычный пользователь
      }
    };

    fetchUserData();
  }, [navigate]);

  // Получение турниров в зависимости от выбранного фильтра
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        let query = supabase.from('tournaments').select('*');
        const now = new Date().toISOString();

        // Применяем фильтры в зависимости от выбранного значения
        if (filter === 'upcoming') {
          query = query.gt('start_date', now); // Только будущие
        } else if (filter === 'ongoing') {
          query = query.lte('start_date', now).gte('end_date', now); // Текущие
        } else if (filter === 'completed') {
          query = query.lt('end_date', now); // Завершенные
        }

        // Сортируем по дате начала (для завершенных - обратный порядок)
        const { data, error } = await query.order('start_date', { 
          ascending: filter !== 'completed' 
        });

        if (error) throw error;
        setTournaments(data || []);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        setError('Ошибка загрузки турниров');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [filter]);

  // Обработчик успешного создания турнира
  const handleTournamentCreated = (newTournament) => {
    setTournaments(prev => [newTournament, ...prev]);
    setShowCreateModal(false);
  };

  // Лоадер при загрузке
  if (loading) {
    return (
      <div className="w-full bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 min-h-screen">

      <div className="mx-auto px-4 py-8 max-w-7xl">
        {/* Заголовок и кнопка создания */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 mr-3 rounded-full shadow shadow-blue-400/50"></span>
              <h2 className="text-2xl font-bold text-white">ТУРНИРЫ</h2>
            </div>
            
            {/* Кнопка создания для организаторов */}
            {userRole === 'organizer' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center p-2 rounded-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500/80 hover:to-purple-500/80 text-white shadow-lg transition-all border border-blue-500/30"
                title="Создать турнир"
                aria-label="Create tournament"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            )}
          </div>

          {/* Фильтры турниров */}
          <div className="flex flex-wrap gap-2">
            {['all', 'upcoming', 'ongoing', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  filter === f 
                    ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white border border-blue-500/30 shadow shadow-blue-500/20'
                    : 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 border border-gray-600 hover:border-blue-400/30'
                }`}
                aria-label={`Filter ${f} tournaments`}
              >
                {f === 'all' ? 'Все' : 
                 f === 'upcoming' ? 'Предстоящие' : 
                 f === 'ongoing' ? 'Текущие' : 'Завершенные'}
              </button>
            ))}
          </div>
        </div>

        {/* Список турниров или сообщение об отсутствии */}
        {tournaments.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-300 mb-2">Турниры не найдены</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {filter === 'upcoming' ? 'Нет предстоящих турниров' :
               filter === 'ongoing' ? 'Нет текущих турниров' :
               filter === 'completed' ? 'Нет завершенных турниров' : 'Турниры еще не созданы'}
            </p>
            {/* Кнопка создания для организаторов при пустом списке */}
            {userRole === 'organizer' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Создать первый турнир
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map(tournament => (
              <TournamentCard 
                key={tournament.id} 
                tournament={tournament} 
                userRole={userRole}
              />
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно создания турнира */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
          <CreateTournamentModal 
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleTournamentCreated}
          />
        </Modal>
      )}
    </div>
  );
}