import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function CreateNewsModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('main'); // 'main' или 'media'
  
  // Состояние формы
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Турниры',
    image_url: '',
    video_url: '',
    summary: ''
  });

  // Ошибки валидации
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    category: '',
    summary: ''
  });

  // Доступные категории новостей
  const categories = ['Турниры', 'Команды', 'Обновления', 'Другое'];

  //Валидация формы
   
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      content: '',
      category: '',
      summary: ''
    };

    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен для заполнения';
      isValid = false;
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Содержание обязательно для заполнения';
      isValid = false;
    }
    if (!formData.summary.trim()) {
      newErrors.summary = 'Краткое описание обязательно для заполнения';
      isValid = false;
    }
    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Обработчик отправки формы
   
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('news')
        .insert([{
          ...formData,
          author_id: user.id,
          published_at: new Date().toISOString()
        }])
        .select();

      if (supabaseError) throw supabaseError;
      
      toast.success('Новость успешно создана');
      onSuccess(data[0]);
    } catch (err) {
      console.error('Error creating news:', err);
      toast.error(err.message || 'Ошибка при создании новости');
    } finally {
      setLoading(false);
    }
  };

  //Загрузка изображения
   
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Проверка типа и размера файла
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Допустимы только JPG, PNG или WebP');
      return;
    }

    if (file.size > maxSize) {
      toast.error('Максимальный размер файла - 5MB');
      return;
    }

    try {
      setLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Изображение загружено');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  //Обновление поля формы
   
  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700">
      {/* Заголовок модального окна */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Создать новость</h3>
      </div>

      {/* Табы для переключения между разделами */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          type="button"
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'main' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('main')}
        >
          Основное
        </button>
        <button
          type="button"
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'media' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('media')}
        >
          Медиа
        </button>
      </div>

      {/* Форма создания новости */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'main' ? (
          /* Основные поля формы */
          <>
            {/* Поле заголовка */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Заголовок *
              </label>
              <input
                type="text"
                className={`w-full px-4 py-2 bg-gray-700 border ${errors.title ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm`}
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                disabled={loading}
              />
              {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
            </div>
            
            {/* Поля категории и других данных */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Категория *
                </label>
                <select
                  className={`w-full px-4 py-2 bg-gray-700 border ${errors.category ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm`}
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  disabled={loading}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category}</p>}
              </div>
            </div>
            
            {/* Краткое описание */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Краткое описание *
              </label>
              <textarea
                className={`w-full px-4 py-2 bg-gray-700 border ${errors.summary ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm`}
                rows="3"
                value={formData.summary}
                onChange={(e) => handleFieldChange('summary', e.target.value)}
                disabled={loading}
              />
              {errors.summary && <p className="mt-1 text-sm text-red-400">{errors.summary}</p>}
            </div>
            
            {/* Содержание новости */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Содержание *
              </label>
              <textarea
                className={`w-full px-4 py-2 bg-gray-700 border ${errors.content ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm`}
                rows="5"
                value={formData.content}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                disabled={loading}
              />
              {errors.content && <p className="mt-1 text-sm text-red-400">{errors.content}</p>}
            </div>
          </>
        ) : (
          /* Медиа-поля формы */
          <>
            {/* Загрузка изображения */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Изображение
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30"
                disabled={loading}
              />
              {formData.image_url && (
                <div className="mt-3">
                  <img 
                    src={formData.image_url} 
                    alt="Превью" 
                    className="max-h-48 rounded-md border border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                    className="mt-2 text-sm text-red-400 hover:text-red-300"
                    disabled={loading}
                  >
                    Удалить изображение
                  </button>
                </div>
              )}
            </div>
            
            {/* Ссылка на видео */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Ссылка на видео (YouTube и т.д.)
              </label>
              <input
                type="url"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm"
                value={formData.video_url}
                onChange={(e) => handleFieldChange('video_url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={loading}
              />
            </div>
          </>
        )}

        {/* Кнопки формы */}
        <div className="pt-2 flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all text-sm"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-lg hover:from-blue-500/80 hover:to-purple-500/80 transition-all text-sm border border-blue-500/30 shadow shadow-blue-500/20 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Загрузка...' : 'Опубликовать новость'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}