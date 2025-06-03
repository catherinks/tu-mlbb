import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Получаем роль пользователя из базы данных
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setUserRole(data?.role);
      }
    };

    fetchUserRole();
  }, [user]);

  // Переключатель мобильного меню
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <div className="h-20"></div>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Логотип */}
            <NavLink to="/" className="relative group">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tighter">
                <span className="text-shadow-neon">Tu.MLBB</span>
              </span>
              {/* Анимация подчеркивания при наведении */}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 shadow shadow-blue-400/50"></span>
              <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300 delay-100 shadow shadow-purple-500/50"></span>
            </NavLink>
            
            {/* Навигация для десктопа */}
            <div className="hidden md:flex space-x-1 lg:space-x-2 bg-gray-800 rounded-lg p-1 border border-gray-700 shadow-inner">
              {/* Основные пункты меню */}
              <NavLink 
                to="/tournaments"
                className={({ isActive }) => 
                  `px-3 lg:px-5 py-2 text-xs lg:text-sm font-semibold rounded-md transition-all relative
                  ${isActive ? 'text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">Турниры</span>
                    {isActive && (
                      <>
                        <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-600/80 to-purple-600/80 -z-10"></span>
                        <span className="absolute inset-0 rounded-md border border-blue-400/30 shadow shadow-blue-400/20"></span>
                      </>
                    )}
                  </>
                )}
              </NavLink>

              <NavLink 
                to="/teams"
                className={({ isActive }) => 
                  `px-3 lg:px-5 py-2 text-xs lg:text-sm font-semibold rounded-md transition-all relative
                  ${isActive ? 'text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">Команды</span>
                    {isActive && (
                      <>
                        <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-600/80 to-purple-600/80 -z-10"></span>
                        <span className="absolute inset-0 rounded-md border border-blue-400/30 shadow shadow-blue-400/20"></span>
                      </>
                    )}
                  </>
                )}
              </NavLink>

              <NavLink 
                to="/news"
                className={({ isActive }) => 
                  `px-3 lg:px-5 py-2 text-xs lg:text-sm font-semibold rounded-md transition-all relative
                  ${isActive ? 'text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">Новости</span>
                    {isActive && (
                      <>
                        <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-600/80 to-purple-600/80 -z-10"></span>
                        <span className="absolute inset-0 rounded-md border border-blue-400/30 shadow shadow-blue-400/20"></span>
                      </>
                    )}
                  </>
                )}
              </NavLink>

              <NavLink 
                to="/streams"
                className={({ isActive }) => 
                  `px-3 lg:px-5 py-2 text-xs lg:text-sm font-semibold rounded-md transition-all relative
                  ${isActive ? 'text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">Трансляции</span>
                    {isActive && (
                      <>
                        <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-600/80 to-purple-600/80 -z-10"></span>
                        <span className="absolute inset-0 rounded-md border border-blue-400/30 shadow shadow-blue-400/20"></span>
                      </>
                    )}
                  </>
                )}
              </NavLink>

              {/* Пункт меню для админа */}
              {userRole === 'admin' && (
                <NavLink 
                  to="/admin"
                  className={({ isActive }) => 
                    `px-3 lg:px-5 py-2 text-xs lg:text-sm font-semibold rounded-md transition-all relative
                    ${isActive ? 'text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">Админ</span>
                      {isActive && (
                        <>
                          <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-600/80 to-purple-600/80 -z-10"></span>
                          <span className="absolute inset-0 rounded-md border border-blue-400/30 shadow shadow-blue-400/20"></span>
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              )}
            </div>

            {/* Кнопка мобильного меню */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Блок авторизации (десктоп) */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {user ? (
                // Профиль авторизованного пользователя
                <NavLink to="/profile" className="flex items-center space-x-2 group">
                  <div className="relative">
                    <div className="w-8 lg:w-9 h-8 lg:h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow shadow-blue-500/30">
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-xs lg:text-sm font-bold text-blue-400">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -inset-1 rounded-full bg-blue-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="hidden lg:inline text-gray-300 group-hover:text-blue-400 transition-colors text-sm font-medium">
                    {user.email.split('@')[0]}
                  </span>
                </NavLink>
              ) : (
                // Кнопки входа/регистрации
                <>
                  <NavLink 
                    to="/login" 
                    className="px-3 lg:px-5 py-2 text-xs lg:text-sm font-semibold text-gray-300 hover:text-white transition-all relative
                    bg-gray-800 rounded-lg border border-gray-700
                    hover:shadow-lg hover:shadow-blue-400/30"
                  >
                    <span className="relative z-10">Вход</span>
                    <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 
                    hover:opacity-20 transition-opacity -z-10 blur-[1px]"></span>
                    <span className="absolute inset-0 rounded-lg border border-transparent hover:border-blue-400/30 
                    transition-all"></span>
                  </NavLink>
                  <NavLink 
                    to="/register" 
                    className="px-3 lg:px-5 py-2 text-xs lg:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg 
                    hover:shadow-lg hover:shadow-blue-500/40 transition-all relative overflow-hidden
                    hover:from-blue-500 hover:to-purple-500 border border-blue-400/50"
                  >
                    <span className="relative z-10">Регистрация</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity"></span>
                    <span className="absolute inset-0 border border-white/10 rounded-lg"></span>
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Мобильное меню (открывается по клику) */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-gray-800 border-t border-gray-700 shadow-xl">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <NavLink 
                  to="/tournaments"
                  onClick={toggleMobileMenu}
                  className={({ isActive }) => 
                    `block px-3 py-3 rounded-md text-base font-medium transition-all
                    ${isActive ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                  }
                >
                  Турниры
                </NavLink>
                <NavLink 
                  to="/teams"
                  onClick={toggleMobileMenu}
                  className={({ isActive }) => 
                    `block px-3 py-3 rounded-md text-base font-medium transition-all
                    ${isActive ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                  }
                >
                  Команды
                </NavLink>
                <NavLink 
                  to="/news"
                  onClick={toggleMobileMenu}
                  className={({ isActive }) => 
                    `block px-3 py-3 rounded-md text-base font-medium transition-all
                    ${isActive ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                  }
                >
                  Новости
                </NavLink>
                <NavLink 
                  to="/streams"
                  onClick={toggleMobileMenu}
                  className={({ isActive }) => 
                    `block px-3 py-3 rounded-md text-base font-medium transition-all
                    ${isActive ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                  }
                >
                  Трансляции
                </NavLink>
                {userRole === 'admin' && (
                  <NavLink 
                    to="/admin"
                    onClick={toggleMobileMenu}
                    className={({ isActive }) => 
                      `block px-3 py-3 rounded-md text-base font-medium transition-all
                      ${isActive ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                    }
                  >
                    Админ
                  </NavLink>
                )}
              </div>
              <div className="px-2 pt-2 pb-4 border-t border-gray-700">
                {user ? (
                  // Профиль в мобильном меню
                  <div className="flex items-center space-x-3 p-2">
                    <NavLink 
                      to="/profile" 
                      onClick={toggleMobileMenu}
                      className="flex items-center space-x-3 group"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow shadow-blue-500/30">
                          <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-400">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-300 group-hover:text-blue-400 transition-colors text-sm font-medium">
                          {user.email.split('@')[0]}
                        </span>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </NavLink>
                  </div>
                ) : (
                  // Кнопки входа в мобильном меню
                  <div className="grid grid-cols-2 gap-3">
                    <NavLink 
                      to="/login" 
                      onClick={toggleMobileMenu}
                      className="px-4 py-3 text-center text-sm font-semibold text-gray-300 hover:text-white transition-all
                      bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600"
                    >
                      Вход
                    </NavLink>
                    <NavLink 
                      to="/register" 
                      onClick={toggleMobileMenu}
                      className="px-4 py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg 
                      hover:from-blue-500 hover:to-purple-500 border border-blue-400/50"
                    >
                      Регистрация
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}