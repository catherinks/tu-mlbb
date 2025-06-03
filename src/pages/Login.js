import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    form: ''
  });

  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  //Преобразует технические сообщения об ошибках в понятные пользователю
   
  const getFriendlyErrorMessage = (error) => {
    if (!error) return 'Произошла неизвестная ошибка';
    
    const errorMessage = error.message || error.toString();
    
    const errorMap = {
      'Invalid login credentials': 'Неверный email или пароль',
      'Email not confirmed': 'Пожалуйста, подтвердите ваш email перед входом',
      'Too many requests': 'Слишком много попыток входа. Попробуйте позже',
      'Email rate limit exceeded': 'Превышен лимит попыток. Попробуйте позже',
    };

    return errorMap[errorMessage] || errorMessage || 'Ошибка при входе';
  };

  // Валидация всей формы входа

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      form: ''
    };

    // Валидация email
    if (!email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Введите корректный email';
      isValid = false;
    }

    // Валидация пароля
    if (!password) {
      newErrors.password = 'Пароль обязателен для заполнения';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Валидация только email (для формы сброса пароля)
  const validateEmail = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      form: ''
    };

    if (!email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Введите корректный email';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Обработчик изменения полей формы
   
  const handleFieldChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    
    // Очищаем ошибки при изменении поля
    setErrors(prev => ({
      ...prev,
      [field]: '',
      form: ''
    }));
  };

  //Обработчик отправки формы входа
   
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, form: '' }));
    
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      setTimeout(() => navigate('/profile'), 100);
    } catch (error) {
      console.error('Login error:', error);
      const friendlyMessage = getFriendlyErrorMessage(error);
      setErrors(prev => ({ ...prev, form: friendlyMessage }));
    } finally {
      setLoading(false);
    }
  }

  //Обработчик сброса пароля
   
  async function handlePasswordReset(e) {
    e.preventDefault();
    
    if (!validateEmail()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, form: '' }));
    
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      
      setResetSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors(prev => ({ ...prev, form: 'Ошибка при отправке письма сброса пароля' }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full bg-gray-900 min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Шапка формы */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">
            {resetSent ? 'Проверьте почту' : 'Войти'}
          </h1>
        </div>
        
        {/* Декоративные элементы (точки по углам) */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400"></div>

        {/* Основное содержимое формы */}
        <div className="p-6">
          {/* Блок для отображения общих ошибок формы */}
          {errors.form && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {errors.form}
            </div>
          )}

          {resetSent ? (
            // Сообщение после отправки ссылки на сброс пароля
            <div className="space-y-5">
              <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg text-blue-300 text-sm">
                Мы отправили письмо с инструкциями по сбросу пароля на адрес {email}. 
                Пожалуйста, проверьте вашу почту.
              </div>
              
              <button
                onClick={() => {
                  setResetSent(false);
                  setErrors({
                    email: '',
                    password: '',
                    form: ''
                  });
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-lg hover:from-blue-500/80 hover:to-purple-500/80 transition-all border border-blue-500/30 shadow shadow-blue-500/20"
              >
                Вернуться к входу
              </button>
            </div>
          ) : (
            // Форма входа
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Поле ввода email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition`}
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>
                
                {/* Поле ввода пароля */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                      Пароль
                    </label>
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      disabled={loading}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    >
                      Забыли пароль?
                    </button>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border ${errors.password ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition`}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
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
                    // Индикатор загрузки
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Вход...
                    </>
                  ) : 'Войти'}
                </button>
              </form>

              {/* Ссылка на регистрацию */}
              <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                <p className="text-gray-400 text-sm">
                  Нет аккаунта?{' '}
                  <Link 
                    to="/register" 
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    Зарегистрироваться
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}