import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация совпадения паролей
    if (password !== confirmPassword) {
      return setError('Пароли не совпадают');
    }

    setLoading(true);
    try {
      // Вызов функции обновления пароля
      const { error } = await updatePassword(password);
      if (error) throw error;
      
      // Успешное обновление
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 2000); // Перенаправление через 2 сек
    } catch (error) {
      setError(error.message || 'Ошибка при обновлении пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-900 min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md overflow-hidden relative p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Обновить пароль</h1>
        
        {/* Сообщение об успехе */}
        {success ? (
          <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-300">
            Пароль успешно обновлен! Перенаправляем вас...
          </div>
        ) : (
          // Форма обновления пароля
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Блок ошибок */}
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {/* Поле нового пароля */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Новый пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition"
                placeholder="Минимум 6 символов"
                required
                minLength={6}
              />
            </div>

            {/* Поле подтверждения пароля */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Подтвердите пароль
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition"
                placeholder="Повторите пароль"
                required
                minLength={6}
              />
            </div>

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-lg hover:from-blue-500/80 hover:to-purple-500/80 transition-all border border-blue-500/30 shadow shadow-blue-500/20 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              aria-label={loading ? 'Обновление пароля...' : 'Обновить пароль'}
            >
              {loading ? 'Обновление...' : 'Обновить пароль'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}