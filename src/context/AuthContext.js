import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Инициализация аутентификации и подписка на изменения
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Проверяем существующую сессию
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Ошибка сессии:', error);
        toast.error('Ошибка загрузки сессии');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Подписываемся на изменения состояния аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // Показываем уведомления для определенных событий
      if (event === 'SIGNED_IN') {
        toast.success('Вход выполнен успешно');
      } else if (event === 'SIGNED_OUT') {
        toast.info('Вы вышли из системы');
      }
    });

    // Отписываемся при размонтировании компонента
    return () => subscription?.unsubscribe();
  }, []);

  //Регистрация нового пользователя
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      
      toast.success('Регистрация успешна! Проверьте почту для подтверждения');
      return { data };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      toast.error(error.message || 'Ошибка регистрации');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  //Обновление пароля пользователя
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Пароль успешно обновлен');
      return { data };
    } catch (error) {
      console.error('Ошибка обновления пароля:', error);
      toast.error(error.message || 'Ошибка обновления пароля');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  //Отправка письма для сброса пароля
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      toast.success('Ссылка для сброса пароля отправлена на почту');
      return true;
    } catch (error) {
      console.error('Ошибка сброса пароля:', error);
      toast.error(error.message || 'Ошибка сброса пароля');
      return false;
    } finally {
      setLoading(false);
    }
  };

  //Вход пользователя
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Ошибка входа:', error);
      toast.error(error.message || 'Неверный email или пароль');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  //Выход пользователя
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
    } catch (error) {
      console.error('Ошибка выхода:', error);
      toast.error(error.message || 'Ошибка при выходе');
    } finally {
      setLoading(false);
    }
  };

  // Значение контекста
  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);