import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [errors, setErrors] = useState({
    profile: null,
    team: null,
    form: {
      first_name: '',
      last_name: '',
      nickname: '',
    },
    teamForm: {
      name: '',
      description: '',
      participants: '',
    }
  });

  // Данные профиля
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nickname: '',
    avatar_url: '',
    team_id: null
  });

  // Данные команды
  const [teamData, setTeamData] = useState(null);
  const [participantsData, setParticipantsData] = useState([]);

  // Модальные окна
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);

  // Форма команды
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    participants: []
  });

  // Поиск игроков
  const [playerSearch, setPlayerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Валидация данных профиля
  const validateProfile = () => {
    const newErrors = {
      first_name: !formData.first_name.trim() ? 'Имя обязательно' : '',
      last_name: !formData.last_name.trim() ? 'Фамилия обязательна' : '',
      nickname: !formData.nickname.trim() 
        ? 'Никнейм обязателен' 
        : formData.nickname.length < 3 
          ? 'Минимум 3 символа' 
          : !/^[a-zA-Z0-9_]+$/.test(formData.nickname) 
            ? 'Только буквы, цифры и _' 
            : ''
    };

    setErrors(prev => ({
      ...prev,
      form: newErrors
    }));

    return !Object.values(newErrors).some(error => error);
  };

  // Валидация данных команды
  const validateTeam = () => {
    const newErrors = {
      name: !teamFormData.name.trim() ? 'Название команды обязательно' : '',
      description: '',
      participants: teamFormData.participants.length > 4 
        ? 'Максимум 4 участника' 
        : ''
    };

    setErrors(prev => ({
      ...prev,
      teamForm: newErrors
    }));

    return !Object.values(newErrors).some(error => error);
  };

  // Загрузка данных профиля и команды при монтировании
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        // Получаем данные пользователя
        const { data: profileData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setFormData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          nickname: profileData.nickname || '',
          avatar_url: profileData.avatar_url || '',
          team_id: profileData.team_id || null
        });

        // Загружаем данные команды, если она есть
        if (profileData.team_id) {
          await fetchTeamData(profileData.team_id);
        }

      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setErrors(prev => ({...prev, profile: "Ошибка загрузки профиля"}));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Загрузка данных команды
  const fetchTeamData = async (teamId) => {
    try {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select(`
          *,
          captain:users!captain_id (id, nickname, avatar_url)
        `)
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      
      setTeamData(teamData);
      await fetchParticipantsData(teamData.participants || []);
    } catch (error) {
      console.error('Error fetching team data:', error);
      setErrors(prev => ({...prev, team: 'Ошибка загрузки данных команды'}));
    }
  };

  //Загрузка данных участников команды
  const fetchParticipantsData = async (participantIds) => {
    const validIds = participantIds.filter(id => id && id !== user.id);
    
    if (validIds.length === 0) {
      setParticipantsData([]);
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, nickname, avatar_url, team_id')
      .in('id', validIds);

    if (!error) {
      setParticipantsData(data);
    }
  };

  //Сохранение профиля
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          nickname: formData.nickname
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Профиль обновлен!");
    } catch (err) {
      setErrors(prev => ({...prev, form: "Ошибка обновления профиля"}));
    } finally {
      setLoading(false);
    }
  };

  //Загрузка аватара
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.id) return;

    try {
      setAvatarLoading(true);
      setErrors(prev => ({...prev, profile: null}));
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Загрузка файла в хранилище
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Получение публичного URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Обновление профиля с новым URL аватара
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setErrors(prev => ({...prev, profile: 'Ошибка загрузки аватара'}));
    } finally {
      setAvatarLoading(false);
      e.target.value = '';
    }
  };

  //Удаление аватара
  const handleDeleteAvatar = async () => {
    if (!user?.id || !formData.avatar_url) return;

    try {
      setAvatarLoading(true);
      setErrors(prev => ({...prev, profile: null}));
      
      // Извлечение имени файла из URL
      const urlParts = formData.avatar_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Удаление файла из хранилища
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([fileName]);

      if (deleteError) throw deleteError;

      // Обновление профиля
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setFormData(prev => ({ ...prev, avatar_url: '' }));
    } catch (error) {
      console.error('Error deleting avatar:', error);
      setErrors(prev => ({...prev, profile: 'Ошибка удаления аватара'}));
    } finally {
      setAvatarLoading(false);
    }
  };

  //Выход из аккаунта
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setErrors(prev => ({...prev, profile: 'Ошибка при выходе из системы'}));
    }
  };

  //Поиск игроков по никнейму
  const searchPlayers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, nickname, avatar_url, team_id')
        .ilike('nickname', `%${query}%`)
        .not('id', 'eq', user.id)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      setErrors(prev => ({...prev, team: 'Ошибка поиска игроков'}));
    } finally {
      setSearchLoading(false);
    }
  };

  //Добавление участника в команду
  const addParticipant = (player) => {
    if (teamFormData.participants.length >= 4) {
      setErrors(prev => ({...prev, teamForm: {...prev.teamForm, participants: 'Максимум 4 участника'}}));
      return;
    }

    if (!teamFormData.participants.includes(player.id)) {
      setTeamFormData(prev => ({
        ...prev,
        participants: [...prev.participants, player.id]
      }));
      setParticipantsData(prev => [...prev, player]);
      setPlayerSearch('');
      setSearchResults([]);
      setErrors(prev => ({...prev, teamForm: {...prev.teamForm, participants: ''}}));
    }
  };

  //Удаление участника из команды
  const removeParticipant = async (participantId) => {
    try {
      setLoading(true);
      
      const updatedParticipants = teamData.participants.filter(id => id !== participantId);
      
      // Обновление списка участников в команде
      const { error } = await supabase
        .from('teams')
        .update({ participants: updatedParticipants })
        .eq('id', teamData.id);

      if (error) throw error;

      // Удаление ссылки на команду у участника
      await supabase
        .from('users')
        .update({ team_id: null })
        .eq('id', participantId);

      // Обновление локального состояния
      setTeamData(prev => ({
        ...prev,
        participants: updatedParticipants
      }));
      
      setParticipantsData(prev => prev.filter(p => p.id !== participantId));
      
    } catch (error) {
      setErrors(prev => ({...prev, team: 'Ошибка при удалении участника'}));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //Открытие модального окна создания команды
  const handleTeamCreate = () => {
    setTeamFormData({
      name: '',
      description: '',
      logo_url: '',
      participants: []
    });
    setIsEditingTeam(false);
    setShowTeamModal(true);
    setErrors(prev => ({...prev, team: null}));
  };

  // Открытие модального окна редактирования команды
  const handleTeamEdit = () => {
    setTeamFormData({
      name: teamData.name,
      description: teamData.description,
      logo_url: teamData.logo_url,
      participants: teamData.participants.filter(id => id !== user.id)
    });
    setIsEditingTeam(true);
    setShowTeamModal(true);
    setErrors(prev => ({...prev, team: null}));
  };

  //Подтверждение выхода из команды
  const handleLeaveTeam = () => {
    setShowConfirmModal(true);
    setErrors(prev => ({...prev, team: null}));
  };

  // Выход из команды
  const confirmLeaveTeam = async () => {
    setShowConfirmModal(false);
    try {
      setLoading(true);
      
      const updatedParticipants = teamData.participants.filter(id => id !== user.id);
      
      if (updatedParticipants.length > 0) {
        // Если в команде остались участники, назначаем нового капитана
        const newCaptainId = teamData.captain_id === user.id 
          ? updatedParticipants[0] 
          : teamData.captain_id;

        const { error: updateError } = await supabase
          .from('teams')
          .update({ 
            participants: updatedParticipants,
            captain_id: newCaptainId
          })
          .eq('id', teamData.id);

        if (updateError) throw updateError;
      } else {
        // Если команда пуста, удаляем ее
        await supabase
          .from('teams')
          .delete()
          .eq('id', teamData.id);
      }

      // Удаляем ссылку на команду у пользователя
      await supabase
        .from('users')
        .update({ team_id: null })
        .eq('id', user.id);

      // Обновление локального состояния
      setTeamData(null);
      setParticipantsData([]);
      setFormData(prev => ({ ...prev, team_id: null }));
    } catch (error) {
      setErrors(prev => ({...prev, team: 'Ошибка при выходе из команды'}));
    } finally {
      setLoading(false);
    }
  };

  // Сохранение данных команды
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateTeam()) return;

    setLoading(true);
    setErrors(prev => ({...prev, team: null}));

    try {
      const participants = [...teamFormData.participants, user.id];
      const validParticipants = participants.filter(Boolean);

      if (validParticipants.length > 5) {
        throw new Error("Максимум 5 участников в команде");
      }

      // Создание или обновление команды
      const { data: team, error: teamError } = isEditingTeam
        ? await supabase
            .from('teams')
            .update({ 
              name: teamFormData.name,
              description: teamFormData.description,
              logo_url: teamFormData.logo_url,
              participants: validParticipants,
              captain_id: teamData.captain_id
            })
            .eq('id', teamData.id)
            .select()
            .single()
        : await supabase
            .from('teams')
            .insert({
              name: teamFormData.name,
              description: teamFormData.description,
              logo_url: teamFormData.logo_url,
              participants: validParticipants,
              captain_id: user.id
            })
            .select()
            .single();

      if (teamError) throw teamError;
      if (!team?.id) throw new Error("Команда не была создана/обновлена");

      // Обновление team_id у всех участников
      const { error: updateError } = await supabase
        .from('users')
        .update({ team_id: team.id })
        .in('id', validParticipants);

      if (updateError) throw updateError;

      // Обновление локального состояния
      setTeamData(team);
      setFormData(prev => ({ ...prev, team_id: team.id }));
      setShowTeamModal(false);
      await fetchParticipantsData(team.participants || []);

    } catch (error) {
      console.error("Ошибка при сохранении команды:", error);
      setErrors(prev => ({...prev, team: error.message || "Ошибка при обновлении команды"}));
    } finally {
      setLoading(false);
    }
  };

  // Рендер страницы
  if (!user) {
    return (
      <div className="w-full bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md w-full">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4 text-center">
            Пожалуйста, войдите в систему
          </h2>
          <Link 
            to="/login" 
            className="block text-center px-4 py-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-lg hover:from-blue-500/80 hover:to-purple-500/80 transition-all border border-blue-500/30"
          >
            Войти
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !showTeamModal && !showConfirmModal) {
    return (
      <div className="w-full bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

 return (
  <div className="w-full bg-gray-900 min-h-screen">
    {/* Блок отображения ошибок */}
    {(errors.profile || errors.team) && (
      <div className="mx-auto px-4 py-2 max-w-2xl">
        <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 flex justify-between items-center">
          <span>{errors.profile || errors.team}</span>
          {/* Кнопка закрытия ошибки */}
          <button 
            onClick={() => setErrors(prev => ({
              ...prev,
              profile: null,
              team: null
            }))} 
            className="text-red-200 hover:text-white text-lg"
          >
            ×
          </button>
        </div>
      </div>
    )}

    {/* Основной контейнер */}
    <div className="mx-auto px-4 py-6 sm:py-12 max-w-2xl">
      {/* Шапка профиля с кнопкой выхода */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 mr-3 rounded-full shadow shadow-blue-400/50"></span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">МОЙ ПРОФИЛЬ</h2>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-600/80 to-red-700/80 text-white rounded-lg hover:from-red-500/80 hover:to-red-600/80 transition-all border border-red-500/30 shadow shadow-red-500/20 text-sm sm:text-base"
        >
          Выйти
        </button>
      </div>

      {/* Карточка профиля пользователя */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6 mb-6">
        {/* Блок аватара */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-700 border-2 border-gray-600 overflow-hidden">
              {avatarLoading ? (
                <div className="flex items-center justify-center h-full w-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <img 
                  src={formData.avatar_url || '/default-avatar.png'} 
                  alt="Аватар"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              )}
            </div>
            {/* Кнопка смены аватара */}
            <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 rounded-full cursor-pointer">
              <span className="text-white text-xs sm:text-sm font-medium">Сменить</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
                className="hidden" 
                disabled={avatarLoading}
              />
            </label>
          </div>
        </div>

        {/* Форма редактирования профиля */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Поле имени */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                Имя *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 border ${
                  errors.form.first_name ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-xs sm:text-sm`}
                value={formData.first_name}
                onChange={(e) => {
                  setFormData({...formData, first_name: e.target.value});
                  if (errors.form.first_name) {
                    setErrors(prev => ({
                      ...prev,
                      form: {...prev.form, first_name: ''}
                    }));
                  }
                }}
              />
              {errors.form.first_name && (
                <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.form.first_name}</p>
              )}
            </div>

            {/* Поле фамилии */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                Фамилия *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 border ${
                  errors.form.last_name ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-xs sm:text-sm`}
                value={formData.last_name}
                onChange={(e) => {
                  setFormData({...formData, last_name: e.target.value});
                  if (errors.form.last_name) {
                    setErrors(prev => ({
                      ...prev,
                      form: {...prev.form, last_name: ''}
                    }));
                  }
                }}
              />
              {errors.form.last_name && (
                <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.form.last_name}</p>
              )}
            </div>
          </div>

          {/* Поле никнейма */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
              Никнейм *
            </label>
            <input
              type="text"
              className={`w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 border ${
                errors.form.nickname ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-xs sm:text-sm`}
              value={formData.nickname}
              onChange={(e) => {
                setFormData({...formData, nickname: e.target.value});
                if (errors.form.nickname) {
                  setErrors(prev => ({
                    ...prev,
                    form: {...prev.form, nickname: ''}
                  }));
                }
              }}
            />
            {errors.form.nickname && (
              <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.form.nickname}</p>
            )}
          </div>

          {/* Информация о команде */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
              Команда
            </label>
            <div className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm">
              {formData.team_id ? (
                teamData ? (
                  <span>{teamData.name}</span>
                ) : (
                  <span className="text-gray-400">Загрузка...</span>
                )
              ) : (
                <span className="text-gray-400">Вы не состоите в команде</span>
              )}
            </div>
          </div>

          {/* Кнопка удаления аватара (если он есть) */}
          {formData.avatar_url && (
            <button
              type="button"
              onClick={handleDeleteAvatar}
              className={`w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 text-red-400 rounded-lg border border-gray-600 transition-all text-xs sm:text-sm ${avatarLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={avatarLoading}
            >
              {avatarLoading ? 'Удаление...' : 'Удалить аватар'}
            </button>
          )}

          {/* Кнопка сохранения изменений */}
          <div className="pt-1 sm:pt-2">
            <button
              type="submit"
              className={`w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-lg hover:from-blue-500/80 hover:to-purple-500/80 transition-all border border-blue-500/30 shadow shadow-blue-500/20 text-xs sm:text-sm ${loading || avatarLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading || avatarLoading}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>

      {/* Блок команды (если пользователь в команде) */}
      {teamData ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6 mb-6">
          {/* Заголовок и кнопки управления командой */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white">Моя команда</h3>
            <div className="flex flex-wrap gap-2">
              {/* Кнопка редактирования (только для капитана) */}
              {teamData.captain_id === user.id && (
                <button 
                  onClick={handleTeamEdit}
                  className="px-2.5 py-1 sm:px-3 sm:py-1 bg-blue-600/80 text-white rounded-lg hover:bg-blue-500/80 transition-all text-xs sm:text-sm"
                >
                  Редактировать
                </button>
              )}
              {/* Кнопка выхода из команды */}
              <button 
                onClick={handleLeaveTeam}
                className="px-2.5 py-1 sm:px-3 sm:py-1 bg-red-600/80 text-white rounded-lg hover:bg-red-500/80 transition-all text-xs sm:text-sm"
              >
                Покинуть
              </button>
            </div>
          </div>

          {/* Информация о команде */}
          <div className="mb-3 sm:mb-4">
            <h4 className="text-base sm:text-lg font-semibold text-white">{teamData.name}</h4>
            {teamData.description && (
              <p className="text-gray-400 text-xs sm:text-sm mt-1">{teamData.description}</p>
            )}
          </div>

          {/* Информация о капитане */}
          <div className="mb-3 sm:mb-4">
            <h5 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Капитан:</h5>
            <div className="flex items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-700 border border-gray-600 overflow-hidden mr-2">
                <img 
                  src={teamData.captain?.avatar_url || '/default-avatar.png'} 
                  alt="Аватар капитана"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              </div>
              <span className="text-white text-sm sm:text-base">{teamData.captain?.nickname || 'Неизвестно'}</span>
            </div>
          </div>

          {/* Список участников команды */}
          <div>
            <h5 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
              Участники ({participantsData.length + 1} из 5):
            </h5>
            <div className="space-y-2">
              {/* Текущий пользователь */}
              <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-700 border border-gray-600 overflow-hidden mr-2">
                    <img 
                      src={formData.avatar_url || '/default-avatar.png'} 
                      alt="Ваш аватар"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  </div>
                  <span className="text-white text-sm sm:text-base">{formData.nickname} (Вы)</span>
                </div>
              </div>

              {/* Другие участники команды */}
              {participantsData.map(participant => (
                <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-700 border border-gray-600 overflow-hidden mr-2">
                      <img 
                        src={participant.avatar_url || '/default-avatar.png'} 
                        alt={`Аватар ${participant.nickname}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    </div>
                    <span className="text-white text-sm sm:text-base">{participant.nickname}</span>
                  </div>
                  {/* Кнопка удаления участника (только для капитана) */}
                  {teamData.captain_id === user.id && (
                    <button 
                      onClick={() => removeParticipant(participant.id)}
                      className="text-red-400 hover:text-red-300 text-xs sm:text-sm"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Кнопка создания команды (если пользователь не в команде) */
        <div className="flex justify-center">
          <button
            onClick={handleTeamCreate}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-lg hover:from-blue-500/80 hover:to-purple-500/80 transition-all border border-blue-500/30 shadow shadow-blue-500/20 text-sm sm:text-base"
          >
            Создать команду
          </button>
        </div>
      )}
    </div>

    {/* Модальное окно создания/редактирования команды */}
    <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)}>
      <div className="bg-gray-800 rounded-lg p-4 w-full max-w-md mx-2 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-white mb-3">
          {isEditingTeam ? 'Редактировать команду' : 'Создать команду'}
        </h3>
        
        <form onSubmit={handleTeamSubmit} className="space-y-3">
          {/* Основная информация о команде */}
          <div className="space-y-3">
            {/* Название команды */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Название команды *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-1.5 bg-gray-700 border ${
                  errors.teamForm.name ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm`}
                value={teamFormData.name}
                onChange={(e) => {
                  setTeamFormData({...teamFormData, name: e.target.value});
                  if (errors.teamForm.name) {
                    setErrors(prev => ({
                      ...prev,
                      teamForm: {...prev.teamForm, name: ''}
                    }));
                  }
                }}
              />
              {errors.teamForm.name && (
                <p className="mt-1 text-xs text-red-400">{errors.teamForm.name}</p>
              )}
            </div>

            {/* Описание команды */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Описание (необязательно)
              </label>
              <textarea
                className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm"
                rows="2"
                value={teamFormData.description}
                onChange={(e) => setTeamFormData({...teamFormData, description: e.target.value})}
              />
            </div>

            {/* Ссылка на логотип */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Ссылка на логотип (необязательно)
              </label>
              <input
                type="url"
                className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm"
                value={teamFormData.logo_url}
                onChange={(e) => setTeamFormData({...teamFormData, logo_url: e.target.value})}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          {/* Блок добавления участников (только при создании или для капитана) */}
          {(!isEditingTeam || teamData?.captain_id === user.id) && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Добавить участников (максимум 4)
                </label>
                <div className="relative">
                  {/* Поиск участников */}
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm"
                    value={playerSearch}
                    onChange={(e) => {
                      setPlayerSearch(e.target.value);
                      searchPlayers(e.target.value);
                    }}
                    placeholder="Поиск по никнейму"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Результаты поиска */}
              {searchResults.length > 0 && (
                <div className="border border-gray-700 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                  {searchResults.map(player => (
                    <div 
                      key={player.id} 
                      className="flex items-center p-2 hover:bg-gray-700/50 cursor-pointer transition border-b border-gray-700 last:border-b-0"
                      onClick={() => addParticipant(player)}
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-600 overflow-hidden mr-2">
                        <img 
                          src={player.avatar_url || '/default-avatar.png'} 
                          alt={`Аватар ${player.nickname}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                      </div>
                      <span className="text-white text-sm flex-1">{player.nickname}</span>
                      {player.team_id && (
                        <span className="text-xs text-yellow-400 ml-2">В команде</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Список выбранных участников */}
              {teamFormData.participants.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-gray-400 mb-1">
                    Выбранные участники ({teamFormData.participants.length})
                  </h5>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {participantsData
                      .filter(p => teamFormData.participants.includes(p.id))
                      .map(participant => (
                        <div key={participant.id} className="flex items-center justify-between p-1.5 bg-gray-700/50 rounded">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-600 overflow-hidden mr-2">
                              <img 
                                src={participant.avatar_url || '/default-avatar.png'} 
                                alt={`Аватар ${participant.nickname}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/default-avatar.png';
                                }}
                              />
                            </div>
                            <span className="text-white text-sm">{participant.nickname}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              setTeamFormData(prev => ({
                                ...prev,
                                participants: prev.participants.filter(id => id !== participant.id)
                              }));
                              setParticipantsData(prev => prev.filter(p => p.id !== participant.id));
                            }}
                            className="text-red-400 hover:text-red-300 text-xs p-1"
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {errors.teamForm.participants && (
                <p className="text-xs text-red-400 mt-1">{errors.teamForm.participants}</p>
              )}
            </div>
          )}

          {/* Кнопки управления модальным окном */}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowTeamModal(false)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all text-sm"
            >
              Отмена
            </button>
            <button
              type="submit"
              className={`px-3 py-1.5 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded hover:from-blue-500/80 hover:to-purple-500/80 transition-all text-sm ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </Modal>

    {/* Модальное окно подтверждения выхода из команды */}
    <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md mx-2 sm:mx-auto">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Подтверждение</h3>
        <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">
          Вы уверены, что хотите покинуть команду {teamData?.name}?
          {teamData?.captain_id === user.id && ' Вы капитан команды, и после вашего ухода капитанство перейдёт другому участнику.'}
        </p>
        <div className="flex justify-end space-x-2 sm:space-x-3">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all text-xs sm:text-sm"
          >
            Отмена
          </button>
          <button
            onClick={confirmLeaveTeam}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600/80 hover:bg-red-500/80 text-white rounded-lg transition-all text-xs sm:text-sm"
          >
            Покинуть команду
          </button>
        </div>
      </div>
    </Modal>
  </div>
);
}