import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import TeamCard from '../components/TeamCard';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Эффект для загрузки данных при монтировании
  useEffect(() => {
    fetchTeams();
  }, []);

  // Загружает список команд из базы данных
  const fetchTeams = async () => {
    try {
      setLoading(true);
      
      // Запрос к Supabase для получения списка команд
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          logo_url,
          description,
          created_at,
          captain_id,
          captain:captain_id (id, nickname, avatar_url),
          participants
        `)
        .order('created_at', { ascending: false }); // Сортировка по дате создания (новые сначала)

      if (error) throw error;
      
      // Форматируем данные команд, добавляя количество участников
      const formattedTeams = data.map(team => ({
        ...team,
        member_count: team.participants?.length || 0
      }));
      
      setTeams(formattedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Не удалось загрузить данные команд');
    } finally {
      setLoading(false);
    }
  };

  // Состояние загрузки
  if (loading) {
    return (
      <div className="w-full bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="w-full bg-gray-900 min-h-screen">
        <div className="mx-auto px-4 py-8 max-w-7xl">
          <div className="bg-red-900/50 text-red-300 p-4 rounded-lg border border-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 py-8 max-w-7xl">
        {/* Заголовок страницы */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 mr-3 rounded-full shadow shadow-blue-400/50"></span>
            <h2 className="text-2xl font-bold text-white">КОМАНДЫ</h2>
          </div>
        </div>

        {/* Отображение списка команд или сообщения об отсутствии команд */}
        {teams.length === 0 ? (
          // Если команд нет
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-300 mb-2">Команды не найдены</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Пока нет зарегистрированных команд
            </p>
          </div>
        ) : (
          // Если есть команды - отображаем их в сетке
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <TeamCard 
                key={team.id} 
                team={{
                  id: team.id,
                  name: team.name,
                  logo_url: team.logo_url,
                  description: team.description,
                  created_at: team.created_at,
                  captain: team.captain,
                  member_count: team.member_count
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}