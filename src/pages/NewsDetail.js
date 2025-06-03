import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { formatNewsDate } from '../utils/dateUtils';

export default function NewsDetail() {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVideo, setIsVideo] = useState(false);
  const [videoId, setVideoId] = useState('');

  // Загрузка данных новости
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Запрос основной новости
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();
        
        // Проверка и обработка видео
        if (data?.video_url) {
          processVideoUrl(data.video_url);
        }
        
        setNewsItem(data);
      } catch (err) {
        console.error('Error fetching news detail:', err);
      } finally {
        setLoading(false);
      }
    };

    // Обработка URL видео (YouTube)
    const processVideoUrl = (url) => {
      // Проверка YouTube
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const youtubeMatch = url.match(youtubeRegex);
      
      if (youtubeMatch && youtubeMatch[1]) {
        setIsVideo(true);
        setVideoId(youtubeMatch[1]);
        return;
      }
    };

    fetchData();
  }, [id]);

  // Состояние загрузки
  if (loading) {
    return (
      <div className="w-full bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Новость не найдена
  if (!newsItem) {
    return (
      <div className="w-full bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="text-center p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            Новость не найдена
          </h2>
          <Link 
            to="/news" 
            className="inline-flex items-center px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Назад к новостям
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 py-12 max-w-4xl">
        {/* Навигация назад */}
        <div className="mb-6">
          <Link 
            to="/news" 
            className="inline-flex items-center px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Назад к новостям
          </Link>
        </div>

        {/* Основной контент новости */}
        <article className="mb-16">
          {/* Мета-информация (категория и дата) */}
          <div className="flex justify-between items-center mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              newsItem.category === 'Турниры' ? 'bg-blue-900/50 text-blue-300 border border-blue-400/30' :
              newsItem.category === 'Команды' ? 'bg-purple-900/50 text-purple-300 border border-purple-400/30' :
              'bg-gray-700 text-gray-400 border border-gray-600'
            }`}>
              {newsItem.category || 'Без категории'}
            </span>
            <span className="text-sm text-gray-400">
              {formatNewsDate(newsItem.published_at)}
            </span>
          </div>
          
          {/* Заголовок новости */}
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 mb-6">
            {newsItem.title}
          </h1>
          
          {/* Встроенное видео (если есть) */}
          {isVideo && (
            <div className="relative rounded-xl overflow-hidden mb-8 border border-gray-700 aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded youtube"
              />
            </div>
          )}
          
          {/* Изображение новости (если нет видео) */}
          {!isVideo && newsItem.image_url && (
            <div className="relative rounded-xl overflow-hidden mb-8 border border-gray-700">
              <img 
                src={newsItem.image_url} 
                alt={newsItem.title}
                className="w-full h-auto max-h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
            </div>
          )}
          
          {/* Текст новости */}
          <div className="prose prose-invert max-w-none text-gray-300 text-lg">
            {newsItem.content}
          </div>
        </article>
      </div>
    </div>
  );
}