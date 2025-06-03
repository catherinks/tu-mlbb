import { useState, useEffect } from 'react';
import { getMLBBStreams, getChannelVideos } from '../api/twich';
import { toast } from 'react-toastify';

export default function Streams() {
  const [streams, setStreams] = useState([]);
  const [videos, setVideos] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const [playingVideo, setPlayingVideo] = useState(null); 

  // Разрешенные каналы для отображения
  const allowedChannels = ['mlbb_cis', 'syberia_gaming', 'oneshotmlbb'];

  // Эффект для загрузки данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем активные стримы
        const streamsData = await getMLBBStreams();
        
        // Фильтруем только разрешенные каналы
        const filteredStreams = streamsData.filter(stream => 
          allowedChannels.includes(stream.user_login.toLowerCase())
        );
        setStreams(filteredStreams);

        // Если нет активных стримов, загружаем записи
        if (filteredStreams.length === 0) {
          const videosPromises = allowedChannels.map(channel => 
            getChannelVideos(channel)
          );
          const videosData = await Promise.all(videosPromises);
          
          // Объединяем и сортируем видео по дате публикации
          const combinedVideos = videosData.flat()
            .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
            .slice(0, 6); // Берем 6 последних видео
          setVideos(combinedVideos);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        toast.error('Ошибка при загрузке трансляций');
      } finally {
        setLoading(false);
      }
    };

    // Первоначальная загрузка данных
    fetchData();
    
    // Устанавливаем интервал для обновления данных каждую минуту
    const interval = setInterval(fetchData, 60000);

    // Очистка интервала при размонтировании компонента
    return () => clearInterval(interval);
  }, []);

  // Воспроизведение видео
  const playVideo = (videoId) => {
    setPlayingVideo(videoId);
    toast.info('Загрузка видео...', { autoClose: 2000 });
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
    toast.error(error);
    return (
      <div className="w-full bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="text-center p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            Произошла ошибка
          </h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 py-12 max-w-7xl">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 mr-3 rounded-full shadow shadow-blue-400/50"></span>
              <span className="text-shadow-light">ТРАНСЛЯЦИИ MLBB CIS</span>
            </h2>
          </div>
        </div>

        {/* Отображение активных стримов или записей */}
        {streams.length > 0 ? (
          <div className="w-full mb-12">
            {streams.map(stream => (
              <div key={stream.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                <div className="w-full min-h-[90vh] flex flex-col">
                  {/* Встроенный плеер Twitch */}
                  <div className="w-full" style={{ height: 'calc(100vh - 300px)' }}>
                    <iframe
                      src={`https://player.twitch.tv/?channel=${stream.user_login}&parent=${window.location.hostname}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      title={stream.title}
                    />
                  </div>
                  
                  {/* Информация о стриме */}
                  <div className="p-6 bg-gray-700">
                    <h3 className="font-semibold text-xl mb-3 text-white line-clamp-2">
                      {stream.title}
                    </h3>
                    <div className="flex justify-between items-center text-base text-gray-300">
                      <span className="font-medium">{stream.user_name}</span>
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                        {stream.viewer_count.toLocaleString()} зрителей
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Сообщение об отсутствии активных стримов */}
            <div className="bg-blue-900/30 rounded-lg p-6 mb-8 text-center border border-blue-800/50">
              <p className="text-blue-300 mb-2 text-lg font-medium">
                Сейчас нет активных трансляций
              </p>
              <p className="text-gray-400">
                Посмотрите последние записи:
              </p>
            </div>
            
            {/* Сетка с записями стримов */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map(video => (
                <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-700">
                  {playingVideo === video.id ? (
                    // Плеер для воспроизводимого видео
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe
                        src={`https://player.twitch.tv/?video=${video.id}&parent=${window.location.hostname}`}
                        className="w-full h-80"
                        frameBorder="0"
                        allowFullScreen
                        title={video.title}
                      />
                    </div>
                  ) : (
                    // Карточка видео
                    <>
                      <div className="aspect-w-16 aspect-h-9 relative">
                        {/* Превью видео */}
                        <img 
                          src={video.thumbnail_url.replace('%{width}', '320').replace('%{height}', '180')}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Кнопка воспроизведения */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <button 
                            onClick={() => playVideo(video.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 transition-all"
                            aria-label="Воспроизвести видео"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      {/* Информация о видео */}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 text-white line-clamp-2">
                          {video.title}
                        </h3>
                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>{video.user_name}</span>
                          <span>
                            {new Date(video.published_at).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}