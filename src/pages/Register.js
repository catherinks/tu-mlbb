import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  // Состояние ошибок валидации
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    form: ''
  });

  //Преобразует технические ошибки в понятные пользователю сообщения
  const getFriendlyErrorMessage = (error) => {
    if (!error) return 'Произошла неизвестная ошибка';
    
    const errorMap = {
      'Email rate limit exceeded': 'Превышен лимит попыток. Попробуйте позже',
      'User already registered': 'Пользователь с таким email уже зарегистрирован',
    };

    return errorMap[error.message] || error.message || 'Ошибка при регистрации';
  };

  //Валидирует данные формы
   
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      form: ''
    };

    // Валидация email
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
      isValid = false;
    }

    // Валидация пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен для заполнения';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }

    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Обрабатывает изменение полей формы
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  //Обрабатывает отправку формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация перед отправкой
    if (!validateForm()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, form: '' }));

    try {
      // Пытаемся зарегистрировать пользователя
      const { error } = await signUp(formData.email, formData.password);
      
      // Если нет ошибки - перенаправляем на страницу подтверждения
      if (!error) {
        navigate('/waiting-confirmation');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Показываем пользователю понятное сообщение об ошибке
      const friendlyMessage = getFriendlyErrorMessage(error);
      setErrors(prev => ({ ...prev, form: friendlyMessage }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-900 min-h-screen flex items-center justify-center p-4">
      {/* Основной контейнер формы */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Шапка формы */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Регистрация</h1>
        </div>
        
        {/* Декоративные элементы (угловые точки) */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400"></div>

        {/* Тело формы */}
        <div className="p-6">
          {/* Блок отображения общих ошибок */}
          {errors.form && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {errors.form}
            </div>
          )}

          {/* Форма регистрации */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Поле email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700 border ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition`}
                placeholder="your@email.com"
                disabled={loading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* Поле пароля */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700 border ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            {/* Поле подтверждения пароля */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-2">
                Подтвердите пароль
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
            </div>

            {/* Кнопка отправки формы */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-lg hover:from-blue-500/80 hover:to-purple-500/80 transition-all border border-blue-500/30 shadow shadow-blue-500/20 flex items-center justify-center ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  {/* Индикатор загрузки */}
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Регистрация...
                </>
              ) : 'Зарегистрироваться'}
            </button>
          </form>

          {/* Ссылка на страницу входа */}
          <div className="mt-6 pt-4 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              Уже есть аккаунт?{' '}
              <Link 
                to="/login" 
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}