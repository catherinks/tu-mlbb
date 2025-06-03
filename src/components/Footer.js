import { NavLink } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 shadow-lg relative overflow-hidden">
      {/*  Декоративные элементы */}
      {/* Верхняя градиентная полоса */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
      
      {/* Размытые градиентные круги для фона */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>

      {/*  Основное содержимое  */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Сетка разделов футера */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/*  Логотип и описание  */}
          <div className="col-span-2 sm:col-span-1">
            <NavLink to="/" className="inline-block mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tighter">
                <span className="text-shadow-neon">Tu.MLBB</span>
              </span>
            </NavLink>
            
            {/* Описание платформы */}
            <p className="text-gray-400 text-xs sm:text-sm">
              Платформа для организации и участия в турнирах по Mobile Legends: Bang Bang. 
              Присоединяйтесь к сообществу киберспортсменов!
            </p>
          </div>

          {/*  Навигация  */}
          <div>
            {/* Заголовок с декоративным элементом */}
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-base sm:text-lg flex items-center">
              <span className="w-1 h-4 sm:h-5 bg-gradient-to-b from-blue-400 to-purple-500 mr-2 rounded-full shadow shadow-blue-400/50"></span>
              Навигация
            </h3>
            
            {/* Список навигационных ссылок */}
            <ul className="space-y-1 sm:space-y-2">
              {['Турниры', 'Команды', 'Новости', 'Трансляции'].map((item) => (
                <li key={item}>
                  <NavLink 
                    to={`/${item.toLowerCase()}`} 
                    className={({ isActive }) => 
                      `text-gray-400 hover:text-blue-400 transition-colors text-xs sm:text-sm ${
                        isActive ? 'text-blue-400 font-medium' : ''
                      }`
                    }
                  >
                    {item}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/*  Контакты  */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-base sm:text-lg flex items-center">
              <span className="w-1 h-4 sm:h-5 bg-gradient-to-b from-blue-400 to-purple-500 mr-2 rounded-full shadow shadow-blue-400/50"></span>
              Контакты
            </h3>
            
            {/* Список контактов с иконками */}
            <ul className="space-y-1 sm:space-y-2">
              {/* Email */}
              <li className="text-gray-400 text-xs sm:text-sm flex items-start">
                <svg className="w-3 h-3 mt-0.5 mr-1.5 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@tu-mlbb.com" className="hover:text-blue-400 break-all">info@tu-mlbb.com</a>
              </li>
              
              {/* Telegram */}
              <li className="text-gray-400 text-xs sm:text-sm flex items-start">
                <svg className="w-3 h-3 mt-0.5 mr-1.5 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 5L2 12.5l7 1M21 5l-2 14.5-7-4.5M21 5L10 14l-1-7" />
                </svg>
                <a href="https://t.me/tu_mlbb" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">@tu_mlbb</a>
              </li>
              
              {/* Discord */}
              <li className="text-gray-400 text-xs sm:text-sm flex items-start">
                <svg className="w-3 h-3 mt-0.5 mr-1.5 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14.5a24.12 24.12 0 01-2.35 2.37 17.17 17.17 0 01-5.65-1.35 17.47 17.47 0 01-.72-.29 17.8 17.8 0 01-1.15-.63L7 14.5a24.9 24.9 0 01-5 0 10.57 10.57 0 002-2.37 24.12 24.12 0 012.35-2.37 17.11 17.11 0 01-6.15-3.83 2 2 0 01-.28-1.86A17.2 17.2 0 016.5 4.8a17.45 17.45 0 015.24-.74 17.18 17.18 0 015.74 1.15 16.9 16.9 0 012.6 1.5 17.68 17.68 0 011.62 1.63 24.27 24.27 0 012.33 2.37 10.61 10.61 0 002 2.37 24.91 24.91 0 01-5 0z" />
                </svg>
                <a href="#" className="hover:text-blue-400">MLBB Community</a>
              </li>
            </ul>
          </div>

          {/*  Социальные сети  */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-base sm:text-lg flex items-center">
              <span className="w-1 h-4 sm:h-5 bg-gradient-to-b from-blue-400 to-purple-500 mr-2 rounded-full shadow shadow-blue-400/50"></span>
              Социальные сети
            </h3>
            
            {/* Иконки соцсетей с hover-эффектами */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {[
                { name: 'Facebook', icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' },
                { name: 'Twitter', icon: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' },
                { name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { name: 'YouTube', icon: 'M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z' }
              ].map((social) => (
                <a 
                  key={social.name}
                  href="#" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 hover:border-blue-400 transition-colors group"
                  aria-label={social.name}
                  title={social.name}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/*  Нижняя часть футера  */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          {/* Копирайт */}
          <p className="text-gray-500 text-xs mb-3 sm:mb-0">
            © {new Date().getFullYear()} Tu.MLBB. Все права защищены.
          </p>
          
          {/* Юридические ссылки */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
            {['Политика конфиденциальности', 'Условия использования', 'Правила платформы'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-gray-500 hover:text-gray-300 text-xs whitespace-nowrap"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}