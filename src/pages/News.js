import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import NewsCard from '../components/NewsCard';
import CreateNewsModal from '../pages/CreateNews';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState(['Все', 'Турниры', 'Команды', 'Обновления']); // Статичные категории
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [userRole, setUserRole] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Получение роли пользователя при загрузке
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        if (!user) {
          navigate('/login');
          return;
        }

        // Запрос роли пользователя
        const { data, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (userError && userError.code !== 'PGRST116') throw userError;
        setUserRole(data?.role || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Загрузка новостей с учетом выбранной категории
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('news')
          .select('*');

        // Фильтрация по категории, если выбрана не "Все"
        if (selectedCategory !== 'Все') {
          query = query.eq('category', selectedCategory);
        }

        const { data, error } = await query.order('published_at', { ascending: false });

        if (error) throw error;
        setNews(data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Ошибка загрузки новостей');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory]);

  // Обработчик успешного создания новости
  const handleNewsCreated = (newNewsItem) => {
    setNews(prev => [newNewsItem, ...prev]);
    setShowCreateModal(false);
  };

  // Индикатор загрузки
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 py-8 max-w-7xl">
        {/* Заголовок и управление */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 mr-3 rounded-full shadow shadow-blue-400/50"></span>
              <span className="text-shadow-light">НОВОСТИ</span>
            </h2>
            
            {/* Кнопка добавления новости (только для редакторов и админов) */}
            {(userRole === 'editor' || userRole === 'admin') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center p-2 rounded-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500/80 hover:to-purple-500/80 text-white shadow-lg transition-all border border-blue-500/30"
                title="Добавить новость"
                aria-label="Add news"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            )}
          </div>

          {/* Фильтры по категориям */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all relative overflow-hidden border ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white border-blue-500/30 shadow shadow-blue-500/20'
                    : 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 border-gray-600 hover:border-blue-400/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Список новостей или сообщение об отсутствии */}
        {news.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-300 mb-2">Новости не найдены</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              В выбранной категории пока нет новостей.
            </p>
            {/* Кнопка создания первой новости (для админов/редакторов) */}
            {(userRole === 'editor' || userRole === 'admin') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-colors"
              >
                Добавить первую новость
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map(item => (
              <NewsCard 
                key={item.id} 
                newsItem={item} 
                userRole={userRole}
              />
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно создания новости */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
          <CreateNewsModal 
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleNewsCreated}
          />
        </Modal>
      )}
    </div>
  );
}