import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

export default function CreateTournamentModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    prize_pool: '',
    rules: '',
    status: 'upcoming' // Статус по умолчанию
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    start_date: '',
    end_date: '',
    date_validation: ''
  });

  // Валидация формы
   
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      start_date: '',
      end_date: '',
      date_validation: ''
    };

    // Проверка обязательных полей
    if (!formData.name.trim()) {
      newErrors.name = 'Название турнира обязательно';
      isValid = false;
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Укажите дату начала';
      isValid = false;
    }
    if (!formData.end_date) {
      newErrors.end_date = 'Укажите дату окончания';
      isValid = false;
    }

    // Проверка корректности дат
    if (formData.start_date && formData.end_date && 
        new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.date_validation = 'Дата окончания должна быть позже даты начала';
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
      // Отправка данных в Supabase
      const { data, error: insertError } = await supabase
        .from('tournaments')
        .insert([formData])
        .select();

      if (insertError) throw insertError;
      
      toast.success('Турнир успешно создан');
      onSuccess(data[0]); // Вызов callback с данными созданного турнира
    } catch (err) {
      console.error('Ошибка создания турнира:', err);
      toast.error(err.message || 'Ошибка при создании турнира');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения полей формы

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очистка ошибок при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Очистка ошибки валидации дат при изменении любой из дат
    if ((field === 'start_date' || field === 'end_date') && errors.date_validation) {
      setErrors(prev => ({ ...prev, date_validation: '' }));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-[95vw] md:max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
      {/* Заголовок модального окна */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-white">Создать турнир</h3>
      </div>

      {/* Форма создания турнира */}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Поле: Название турнира */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
            Название турнира *
          </label>
          <input
            type="text"
            className={`w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 border ${
              errors.name ? 'border-red-500' : 'border-gray-600'
            } rounded-md sm:rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-xs sm:text-sm`}
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            disabled={loading}
          />
          {errors.name && <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.name}</p>}
        </div>
        
        {/* Поле: Описание */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
            Описание
          </label>
          <textarea
            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 border border-gray-600 rounded-md sm:rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-xs sm:text-sm"
            rows="2"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            disabled={loading}
          />
        </div>
        
        {/* Группа полей: Даты начала и окончания */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
          {/* Поле: Дата начала */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
              Дата начала *
            </label>
            <input
              type="datetime-local"
              className={`w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 border ${
                errors.start_date || errors.date_validation ? 'border-red-500' : 'border-gray-600'
              } rounded-md sm:rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-xs sm:text-sm`}
              value={formData.start_date}
              onChange={(e) => handleFieldChange('start_date', e.target.value)}
              disabled={loading}
            />
            {errors.start_date && <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.start_date}</p>}
          </div>
          
          {/* Поле: Дата окончания */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
              Дата окончания *
            </label>
            <input
              type="datetime-local"
              className={`w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 border ${
                errors.end_date || errors.date_validation ? 'border-red-500' : 'border-gray-600'
              } rounded-md sm:rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-xs sm:text-sm`}
              value={formData.end_date}
              onChange={(e) => handleFieldChange('end_date', e.target.value)}
              disabled={loading}
            />
            {errors.end_date && <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.end_date}</p>}
          </div>
        </div>
        
        {/* Ошибка валидации дат */}
        {errors.date_validation && (
          <div className="text-xs sm:text-sm text-red-400 -mt-2 sm:-mt-3">
            {errors.date_validation}
          </div>
        )}
        
        {/* Поле: Призовой фонд */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
            Призовой фонд ($)
          </label>
          <input
            type="number"
            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 border border-gray-600 rounded-md sm:rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-xs sm:text-sm"
            value={formData.prize_pool}
            onChange={(e) => handleFieldChange('prize_pool', e.target.value)}
            min="0"
            disabled={loading}
          />
        </div>
        
        {/* Поле: Правила турнира */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
            Правила турнира
          </label>
          <textarea
            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 border border-gray-600 rounded-md sm:rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-xs sm:text-sm"
            rows="3"
            value={formData.rules}
            onChange={(e) => handleFieldChange('rules', e.target.value)}
            disabled={loading}
          />
        </div>
        
        {/* Кнопки действий */}
        <div className="pt-1 sm:pt-2 flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
          {/* Кнопка отмены */}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md sm:rounded-lg transition-all text-xs sm:text-sm"
            disabled={loading}
          >
            Отмена
          </button>
          
          {/* Кнопка отправки формы */}
          <button
            type="submit"
            className={`px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-md sm:rounded-lg hover:from-blue-500/80 hover:to-purple-500/80 transition-all text-xs sm:text-sm border border-blue-500/30 shadow shadow-blue-500/20 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Создание...' : 'Создать турнир'}
          </button>
        </div>
      </form>
    </div>
  );
}