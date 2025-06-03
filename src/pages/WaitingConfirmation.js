import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function WaitingConfirmation() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Получаем данные текущего пользователя

  // Эффект для перенаправления уже авторизованных пользователей
  useEffect(() => {
    if (user) {
      navigate('/profile'); // Если пользователь авторизован, идем в профиль
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      {/* Карточка с содержимым */}
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-md w-full shadow-lg">
        {/* Заголовок */}
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Проверьте ваш email
        </h1>
        
        {/* Инструкция для пользователя */}
        <p className="text-gray-300 mb-6 text-center">
          Мы отправили ссылку для подтверждения на ваш email.<br />
          Пожалуйста, проверьте почту и перейдите по ссылке,<br />
          чтобы завершить регистрацию.
        </p>

        {/* Кнопка перехода к авторизации */}
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Перейти к странице входа"
        >
          Перейти к входу
        </button>
      </div>
    </div>
  );
}