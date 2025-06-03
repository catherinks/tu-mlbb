import { Link } from 'react-router-dom';
import { formatNewsDate } from '../utils/dateUtils';

export default function NewsCard({ newsItem }) {
  // Если данные новости отсутствуют, показываем сообщение
  if (!newsItem) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
        Нет данных
      </div>
    );
  }

  // Определяем стили для категорий
  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Турниры':
        return 'bg-blue-900/70 text-blue-300';
      case 'Команды':
        return 'bg-purple-900/70 text-purple-300';
      default:
        return 'bg-gray-700/70 text-gray-400';
    }
  };

  return (
    <Link 
      to={`/news/${newsItem.id}`}
      className="group relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-blue-400/50 transition-all duration-300 flex flex-col h-full"
    >
      {/* Блок с изображением новости */}
      {newsItem.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={newsItem.image_url} 
            alt={newsItem.title || 'Новость'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Градиент поверх изображения */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
          
          {/* Бейдж категории (только при наличии изображения) */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryStyles(newsItem.category)}`}>
              {newsItem.category || 'Без категории'}
            </span>
          </div>
        </div>
      )}
      
      {/* Основной контент карточки */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Заголовок и дата публикации */}
        <div className="flex justify-between items-start mb-4">
          {/* Бейдж категории (если нет изображения) */}
          {!newsItem.image_url && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryStyles(newsItem.category)} border ${
              newsItem.category === 'Турниры' ? 'border-blue-400/30' :
              newsItem.category === 'Команды' ? 'border-purple-400/30' :
              'border-gray-600'
            }`}>
              {newsItem.category || 'Без категории'}
            </span>
          )}
          
          {/* Дата публикации */}
          <span className="text-xs text-gray-500">
            {formatNewsDate(newsItem.published_at)}
          </span>
        </div>
        
        {/* Заголовок новости */}
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 group-hover:from-blue-400 group-hover:to-purple-400 transition-all mb-3">
          {newsItem.title || 'Без названия'}
        </h3>
        
        {/* Краткое описание */}
        <p className="text-gray-400 mb-4 line-clamp-2 group-hover:text-gray-300 transition-colors flex-grow">
          {newsItem.summary || 'Описание отсутствует'}
        </p>
        
        {/* Футер карточки */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
          {/* Кнопка "Читать" */}
          <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 group-hover:from-blue-300 group-hover:to-purple-300 transition-all">
            Читать →
          </span>
        </div>
      </div>

      {/* Декоративные элементы (точки по углам) */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Link>
  );
}