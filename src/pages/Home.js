import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import TournamentCard from '../components/TournamentCard';
import NewsCard from '../components/NewsCard';
import { NavLink } from 'react-router-dom';

export default function Home() {
  const [news, setNews] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Параллельный запрос новостей и турниров
        const [newsRes, tournamentsRes] = await Promise.all([
          supabase
            .from('news')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(3),
          supabase
            .from('tournaments')
            .select('*')
            .order('start_date', { ascending: true })
            .limit(3)
        ]);

        // Обработка ошибок
        if (newsRes.error) throw newsRes.error;
        if (tournamentsRes.error) throw tournamentsRes.error;

        // Установка данных в состояние
        setNews(newsRes.data);
        setTournaments(tournamentsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Отображение индикатора загрузки
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 shadow shadow-blue-400/50"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Баннер */}
        <section className="mb-12 sm:mb-16 relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700 shadow-[0_0_20px_3px_rgba(96,165,250,0.1)] sm:shadow-[0_0_30px_5px_rgba(96,165,250,0.1)]">
          {/* Декоративные элементы */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 via-purple-500 to-transparent opacity-80" />
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-blue-400 opacity-80" />
          <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-64 sm:h-64 bg-blue-500 rounded-full opacity-10 blur-xl sm:blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-64 sm:h-64 bg-purple-500 rounded-full opacity-10 blur-xl sm:blur-3xl animate-pulse animation-delay-2000" />
          
          {/* Контент баннера */}
          <div className="relative z-10 p-6 sm:p-8 md:p-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 uppercase tracking-wider">
              <span className="text-shadow-neon">ПОГРУЗИТЕСЬ В МИР MLBB</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 max-w-2xl font-medium">
              Все турниры Mobile Legends в одном месте. Регистрируйте команды, следите за результатами 
              и смотрите трансляции лучших матчей.
            </p>
            
            {/* Кнопки призыва к действию */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <NavLink 
                to="/tournaments" 
                className="px-5 py-2 sm:px-6 sm:py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg 
                hover:shadow-lg hover:shadow-blue-500/40 transition-all relative overflow-hidden
                border border-blue-500 hover:from-blue-500 hover:to-blue-600 text-center"
              >
                <span className="relative z-10">Турниры</span>
              </NavLink>
              <NavLink 
                to="/register" 
                className="px-5 py-2 sm:px-6 sm:py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg 
                hover:shadow-lg hover:shadow-purple-500/40 transition-all relative overflow-hidden
                border border-purple-500 hover:from-purple-500 hover:to-purple-600 text-center"
              >
                <span className="relative z-10">Регистрация</span>
              </NavLink>
            </div>
          </div>
        </section>

        {/*  Секция турниров */}
        <section id="tournaments" className="mb-12 sm:mb-16 relative">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
              <span className="w-1 h-5 sm:h-6 bg-gradient-to-b from-blue-400 to-purple-500 mr-2 sm:mr-3 rounded-full shadow shadow-blue-400/50"></span>
              <span className="text-shadow-light">БЛИЖАЙШИЕ ТУРНИРЫ</span>
            </h2>
            <NavLink 
              to="/tournaments" 
              className="text-xs sm:text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center group"
            >
              Все турниры
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </NavLink>
          </div>
          
          {/* Список турниров */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tournaments.map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </section>

        {/* Секция новостей  */}
        <section id="news" className="relative">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
              <span className="w-1 h-5 sm:h-6 bg-gradient-to-b from-blue-400 to-purple-500 mr-2 sm:mr-3 rounded-full shadow shadow-blue-400/50"></span>
              <span className="text-shadow-light">ПОСЛЕДНИЕ НОВОСТИ</span>
            </h2>
            <NavLink 
              to="/news" 
              className="text-xs sm:text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center group"
            >
              Все новости
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </NavLink>
          </div>
          
          {/* Список новостей */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {news.map(item => (
              <NewsCard key={item.id} newsItem={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}