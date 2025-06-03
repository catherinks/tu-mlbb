import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailSearch, setEmailSearch] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Доступные роли пользователей
  const availableRoles = [
    { value: 'admin', label: 'Администратор' },
    { value: 'editor', label: 'Редактор' },
    { value: 'organizer', label: 'Организатор' },
    { value: 'user', label: 'Пользователь' }
  ];

  // Загрузка пользователей при монтировании компонента
  useEffect(() => {
    fetchUsers();
  }, []);

  // Фильтрация пользователей при изменении поискового запроса
  useEffect(() => {
    if (emailSearch.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(emailSearch.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [emailSearch, users]);

  /**
   * Загружает список пользователей из базы данных
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, nickname, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  // Обрабатывает клик по изменению роли
  const handleRoleChangeClick = (userId, currentRole) => {
    setSelectedUser(userId);
    setNewRole(currentRole);
    setShowConfirmModal(true);
  };

  //Подтверждает изменение роли пользователя 
  const confirmRoleChange = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', selectedUser);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === selectedUser ? { ...user, role: newRole } : user
      ));
      
      toast.success('Роль пользователя успешно обновлена');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Ошибка при обновлении роли');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  // Возвращает стилизованный бейдж для роли пользователя
   
  const getRoleBadge = (role) => {
    const roleInfo = availableRoles.find(r => r.value === role);
    if (!roleInfo) return role;
    
    let bgColor = 'bg-gray-600';
    if (role === 'admin') bgColor = 'bg-red-600';
    if (role === 'editor') bgColor = 'bg-blue-600';
    if (role === 'organizer') bgColor = 'bg-purple-600';
    
    return (
      <span className={`${bgColor} text-white px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
        {roleInfo.label}
      </span>
    );
  };

  // Отображение загрузки
  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Заголовок и поиск */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 mr-3 rounded-full shadow shadow-blue-400/50"></span>
              <span className="text-shadow-light">УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</span>
            </h2>
          </div>

          {/* Поле поиска */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="Поиск по email..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Таблица для десктопов */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имя</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Никнейм</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Роль</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Изменить роль</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="truncate max-w-[180px]">{user.email}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.nickname || '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChangeClick(user.id, e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      >
                        {availableRoles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-400">
                    {emailSearch ? 'Пользователи не найдены' : 'Нет пользователей для отображения'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Карточки для мобильных устройств */}
        <div className="md:hidden space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium truncate max-w-[200px]">{user.email}</h3>
                    <p className="text-gray-300 text-sm mt-1">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-gray-300 text-sm">
                      Ник: {user.nickname || '-'}
                    </p>
                  </div>
                  <div className="mt-1">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
                <div className="mt-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChangeClick(user.id, e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                  >
                    {availableRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-800 rounded-lg p-4 text-center text-sm text-gray-400">
              {emailSearch ? 'Пользователи не найдены' : 'Нет пользователей для отображения'}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения изменения роли */}
      {showConfirmModal && (
        <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg max-w-md w-full mx-2">
            <h3 className="text-lg font-medium text-white mb-4">Подтверждение изменения роли</h3>
            <p className="text-gray-300 mb-6">
              Вы уверены, что хотите изменить роль пользователя?
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmRoleChange}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-colors"
                disabled={loading}
              >
                {loading ? 'Сохранение...' : 'Подтвердить'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}